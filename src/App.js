import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

import './App.css';

// Development build or production?
const isDev = window.require('electron-is-dev');

// Common module requirements
const fs = window.require('fs');
const path = window.require('path');
const shell = window.require('electron').shell;
const app = window.require('electron').remote.app;
const symlink = window.require('windows-shortcuts-ps');
const md5 = require('md5');
const iconPromise = window.require('icon-promise');


// Datastores
const Datastore = require('nedb');
let db_applets = new Datastore({
  filename : 'ui_elements_testing',
  autoload : true
});

// TESTING
const DEV_HASHES = false; //
const DEV_IDS = true;


// -------------------------------------------------------
// ---------------  DATABASE FUNCTIONS   -----------------
// -------------------------------------------------------

/**
 * Insert an entry into a nedb datastore, as a promise.
 * @param {Datastore} datastore The datastore to insert an entry into
 * @param {string} object_insert The object to insert into the datastore
 * @nedb Add a datastore entry to hold the defined object_insert
 * @return Returns a copy of the object_insert stored, including the nedb _id
 */
async function dbInsert(datastore, object_insert) {
  let promise = new Promise((resolve, reject) => {
    datastore.insert(object_insert, function (err, newDoc) {
      resolve(newDoc);
    });
  });

  return await promise;
}

/**
 * Search a nedb datastore for ONE occurance of the token, as a promise.
 * @param {Datastore} datastore The datastore to search
 * @param {string} token The token to search the datastore for
 * @return Returns a copy of the entry found
 */
async function dbFindOne(datastore, token) {
  let promise = new Promise((resolve, reject) => {
    datastore.findOne(token, (err,docs) => resolve(docs));
  });

  return await promise;
}

/**
 * Search a nedb datastore for ALL occurance of the token, as a promise.
 * @param {Datastore} datastore The datastore to search
 * @param {string} token The token to search the datastore for
 * @return Returns a list of all entries found
 */
async function dbFindAll(datastore, token) {
  let promise = new Promise((resolve, reject) => {
    datastore.find(token, (err,docs) => resolve(docs));
  });

  return await promise;
}

// CONSTANTS
const DEG_TO_RAD = 0.0174533;
let MODULES = {};
let COMP = [];//[<p>REACTIVE DYNAMICS</p>, <div><p>DESTRUCTIVE DYNAMICS</p><p>DESTRUCTIVE DYNAMICS</p></div>];
let ELEMENTS = [
  {
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/800px-Wikipedia-logo-v2.svg.png",
    symlink: 'https://www.wikipedia.org/',
    onClick: () => {
      shell.openItem('https://www.wikipedia.org/')
    }
  },
  {
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
    symlink: 'https://www.google.com/',
    onClick: () => {
      shell.openItem('https://www.google.com/')
    }
  },
  {
    icon: "https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png",
    symlink: 'https://reactjs.org/',
    onClick: () => { shell.openItem('https://reactjs.org/') }
  },
  {
    icon: "https://intentionallt_errored_search",
    symlink: 'https://en.wikipedia.org/wiki/Kitten',
    onClick: () => { shell.openItem('https://en.wikipedia.org/wiki/Kitten') }
  }
];


// UTILITY FUNCTIONS

/**
 * Converts an angle from degrees to radians.
 * @param {number} degrees The angle in degrees
 * @return {number} The angle in radians
 */
function toRadians(degrees) {
  return degrees * DEG_TO_RAD;
}


/**
 * Converts a path, link, or URL into the absolute path to the resource
 * @param {string} resourcePath The string path of the original file or link
 * @return {string} The absolute path to the intended file
 */
async function getAbsPath(resourcePath) {
  // If symlink or URL get absolute path, otherwise we already have absolute path
  let fileExtension = resourcePath.split('.').pop();
  if (fileExtension === 'url' ||
      fileExtension === 'lnk') {
        return await symlink.getPath(resourcePath)
        .catch(err => alert(err));
  } else {
    return resourcePath;
  }
}


/**
 * Extracts image data from a file's icon and saves it to the application's
 *     AppData folder.
 * @param {string} resourcePath The string path of the original file or link
 * @return {base64} The absolute path of the extracted icon image file
 */
async function getSavedIcon(resourcePath) {
  // If production, point to app.asar.unpacked location for IconExtractor.exe
  if (!isDev) {
    iconPromise.overrideExtractorPath(
      path.join(
        app.getAppPath() + '.unpacked',
        'node_modules',
        'icon-promise',
        'bin'
      )
    );
  }

  // Get 256x256 icon image data, and determine its MD5 hash
  let iconData = null;
  let hashData = null;
  try {
    iconData = (await iconPromise.getIcon256(resourcePath)).Base64ImageData;
    hashData = md5(iconData);
  } catch(err) {
    alert(err);
  }

  // If the icon is not already saved/known then save a copy for the application
  let savedPath = getIconPath(hashData + '.png');
  if (!fs.existsSync(savedPath)) {
    // If the icon_storage folder does not already exist then create it
    if (!fs.existsSync(getIconPath())) {
      fs.mkdirSync(getIconPath());
    }

    // Save a copy of the icon for the application
    fs.writeFileSync(savedPath, iconData, 'base64', (err) => {
      alert(err);
    });
  }

  // Return the path to the saved icon.
  if (isDev) {
    // I HATE THIS LINE, but in dev mode electron looks for resources oddly
    return './icon_storage/' + hashData + '.png';
  } else {
    return savedPath;
  }
}


/**
 * Provides the path to the applictaion resources directory. If an argument
 *     is provided the filepath to the argument will be provided
 * @param {string} fileName The string name of a file within the intended path
 * @return {string} The path of the applictaion resources directory or file
 */
function getAppPath(fileName = "") {
  if (isDev) {
  	return "./public/" + fileName;
  } else {
  	return path.join(app.getPath('userData'), fileName);
  }
}


/**
 * Provides the path to the icon resources directory. If an argument
 *     is provided the filepath to the argument will be provided
 * @param {string} fileName The string path of the original file or link
 * @return {string} The path of the icon resources directory or file
 */
function getIconPath(fileName = "") {
  if (isDev) {
  	return './public/icon_storage/' + fileName;
  } else {
  	return path.join(app.getPath('userData'), 'icon_storage', fileName);
  }
}


// -------------------------------------------------------
// -------------   APP CONTROLLER CLASS   ----------------
// -------------------------------------------------------
class App extends React.Component {
  constructor(props) {
    super(props);

    // this.addElement = this.addElement.bind(this);
    this.setMainIcon = this.setMainIcon.bind(this)
    //this.addElement = this.addElement.bind(this)

    this.state = {
      flyOutRadius: 120,
      seperationAngle: 40,
      mainButtonDiam: 90,
      childButtonDiam: 50,
      numElements: Object.keys(ELEMENTS).length,
      stiffness: 320,
      damping: 17,
      rotation: 0,
      mainButtonIcon: "https://cdn.iconscout.com/icon/free/png-256/react-2-458175.png",
      mainButtonIconActive: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png",
      mainButtonIconSize: 0.7,
      childButtonIconSize: 0.7,
      to_remove: "",

      COMP : [], //<p>REACTIVE DYNAMICS</p>, <div><p>DESTRUCTIVE DYNAMICS</p><p>DESTRUCTIVE DYNAMICS</p></div>

      // Apparently this is EXTREMELY IMPORTANT - Need to fix that...
      // ONLY REQUIRED BECAUSE THE HARDCODED PROPS MENU!!!!
      //ui_props: {"dummy_id" : {properties : {elements: []}}}
    };

    // Load available Applets' modules
    this.loadAppletModules();

    // Load applet instance state from last run of program
    this.loadAppletsOnStart();

    //this.firstLoad();
    this.updateLoad();


    // this.dummyLoad3();
    // this.state.ui_props = {elements: [
    //   {
    //     icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/800px-Wikipedia-logo-v2.svg.png",
    //     symlink: 'https://www.wikipedia.org/',
    //     onClick: () => {
    //       shell.openItem('https://www.wikipedia.org/')
    //
    //       // var Datastore = require('nedb'), db = new Datastore({filename : 'guitars'});
    //       // db.loadDatabase();
    //
    //       // alert(9);
    //       // db.insert({name : "fender jazz bass", year:1977});
    //       //db.update({year : 1977}, {name : "gibson thunderbird", year: 1990}, {});
    //     }
    //   },
    //   {
    //     icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/800px-Wikipedia-logo-v2.svg.png",
    //     symlink: 'https://www.wikipedia.org/',
    //     onClick: () => {
    //       shell.openItem('https://www.wikipedia.org/')
    //
    //       // var Datastore = require('nedb'), db = new Datastore({filename : 'guitars'});
    //       // db.loadDatabase();
    //
    //       // alert(9);
    //       // db.insert({name : "fender jazz bass", year:1977});
    //       //db.update({year : 1977}, {name : "gibson thunderbird", year: 1990}, {});
    //     }
    //   }
    // ]};
  }

  componentDidMount() {
    //this.loadAppletsOnStart();

    //alert(this.state.ui_props["dummy_id"].properties.elements);
    // First load MODULES that are acceptable by applet id
    //MODULES["dummy_applet_id"] = require('./applet_modules/MenuButton');

    //const applets_to_load = ["MenuButton.js"]//["D:\\SoftwareProjects\\Javascript\\Elysian Cannon\\src\\MenuButton.js"];
    // applets_to_load.forEach( applet_module => {
    //   //this.loads(applet_module);
    //   //MODULES["dummy_applet_id"] = require("./applet_modules/" + applet_module);
    //   // if (isDev) {
    //   //   MODULES["dummy_applet_id"] = require("D:/SoftwareProjects/Javascript/Elysian Cannon/src/applet_modules/" + applet_module);
    //   // } else {
    //   //   MODULES["dummy_applet_id"] = require("D:\\SoftwareProjects\\Javascript\\Elysian Cannon\\src\\applet_modules\\" + applet_module);
    //   // }
    //
    //   //MODULES["dummy_applet_id"] = require("D:/SoftwareProjects/Javascript/Elysian Cannon/src/applet_modules/" + applet_module);
    // //   alert(applet_module);
    // //   let new_applet = await import(applet_module).then( m => {
    // //     MODULES["dummy_applet_id"] = m;
    // //   });
    // });

    //this.dummyLoad3();
  }

  // async loads(applet_module) {
  //   alert(applet_module);
  //   let new_applet = await import(applet_module);
  //   MODULES["dummy_applet_id"] = new_applet;
  // }

  firstLoad() {
    db_applets.insert({
      id_applet : "dummy_applet_id",
      load_on_start : true,
      properties : {
        elements : ELEMENTS,
        flyOutRadius: 120,
        seperationAngle: 40,
        mainButtonDiam: 90,
        childButtonDiam: 50,
        numElements: 4,
        stiffness: 320,
        damping: 17,
        rotation: 0,
        mainButtonIcon: "https://cdn.iconscout.com/icon/free/png-256/react-2-458175.png",
        mainButtonIconActive: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png",
        mainButtonIconSize: 0.7,
        childButtonIconSize: 0.7
      }});
  }

  updateLoad() {
    db_applets.update({_id : "FC4jXzlQZwxLaPd2"},{
      id_applet : "dummy_applet_id",
      load_on_start : true,
      properties : {
        elements : ELEMENTS,
        flyOutRadius: 240,
        seperationAngle: 40,
        mainButtonDiam: 90,
        childButtonDiam: 25,
        numElements: 4,
        stiffness: 320,
        damping: 17,
        rotation: 0,
        mainButtonIcon: "https://cdn.iconscout.com/icon/free/png-256/react-2-458175.png",
        mainButtonIconActive: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png",
        mainButtonIconSize: 0.7,
        childButtonIconSize: 0.7
      }}, {});
  }









  //

  setMainIcon(icon) {
    this.setState(prevState => ({
      mainButtonIcon: icon
    }));
  }

  getInputProps(type, title) {
    return {
      type: type,
      value: this.state.ui_props["FC4jXzlQZwxLaPd2"].properties[title],
      onChange: e => {
        let target_value = e.target.value;
        type === "number"
          // ? this.setState({ [title]: parseInt(e.target.value || 0, 10) })
          // : this.setState({ [title]: e.target.value })
          ? this.setState(prevState => ({
            ...prevState,
            ui_props: {
              ...prevState.ui_props,
              dummy_id: {
                ...prevState.ui_props.dummy_id,
                properties: {
                  ...prevState.ui_props.dummy_id.properties,
                  [title]: parseInt(target_value || 0, 10) }}}}))
          : this.setState(prevState => ({
            ...prevState,
            ui_props: {
              ...prevState.ui_props,
              dummy_id: {
                ...prevState.ui_props.dummy_id,
                properties: {
                  ...prevState.ui_props.dummy_id.properties,
                  [title]: target_value }}}}))
    }};
  }

  getRemoveApplet() {
    return {
      value: this.state.to_remove,
      onChange: e => {
        let target_value = e.target.value;
        this.setState(prevState => ({
          to_remove : target_value
        }))
    }};
  }


  /**
   * Applet and Module - Load, Unload, and Update Functions
   */

  /**
   * Load the array of Applet Modules to be available to the user and to the
   *     application as a whole.
   */
  loadAppletModules() {
    // Currently HARDCODED. TODO: Make dynamic
    let new_module = require('./applet_modules/MenuButton.js');//{MenuButton : MenuButton2};
    if (DEV_HASHES) alert(md5(new_module.AppletMain));
    MODULES["dummy_applet_id"] = new_module;
  }

  /**
   * Load the Applets along with their saved states. Load the user's stored
   *     state tree for each applet from the datastore into state.ui_props,
   *     and load the components.
   * @state Adds all of the user's Applets along with their stored state trees
   *     from the datastore to the state.ui_props object
   */
  loadAppletsOnStart() {
    // Promise to return an array of loaded state trees of the loaded applets
    let promise = new Promise((resolve, reject) => {
      dbFindAll(db_applets, {load_on_start : true}).then(applets => {
        resolve(applets.map(applet => {
          // Allow remapping through Module function, if desired/available
          if ("propsMap" in MODULES[applet.id_applet]){
            MODULES[applet.id_applet].propsMap(applet.properties);}
          return applet;
        }));
      });
    });//

    // Get array of loaded state trees then write each tree to state.ui_props
    promise.then(applet_state => {
      let state_tree = applet_state.reduce((map, obj) => {
        let { _id, ..._state } = obj;
        if (DEV_HASHES) alert(_id);
        map[_id] = _state;
        return map;//
      }, {});

      // Write each stored state tree into the state.ui_props object
      this.setState(prevState => ({
        ui_props : state_tree
      }));
    }).then(() => {
      // Add loaded applets to array for dynamic component loading
      this.setState(prevState => ({
        COMP : Object.keys(prevState.ui_props).map(id_instance => ({
          app : MODULES[prevState.ui_props[id_instance].id_applet].AppletMain,
          id : id_instance
        }))
      }));
    });
  }

  /**
   * Load a new Applet by its module id. Load the default state tree into state,
   *     add a datastore entry to hold the data, and load the component.
   * @param {string} id_module The module id to reference for the new Applet
   * @state Adds the default state tree provided by the module to the
   *     state.ui_props object with id_applet as the key
   * @nedb Adds a datastore entry to hold the default state tree and other data
   */
  loadNewApplet(id_module) {
    // Insert the default state tree into the datastore
    dbInsert(db_applets, {
      id_applet : id_module,
      load_on_start : true,
      properties : MODULES[id_module].defaultProps()
    }).then(db_entry => {
      // Insert the default state tree into state.ui_props and load the component
      this.setState(prevState => ({
        ui_props : {...prevState.ui_props, ...{
          [db_entry._id] : {
            id_applet : id_module,
            load_on_start : true,
            properties : MODULES[id_module].defaultProps()
          }
        }},
        COMP : [...prevState.COMP, {
          app : MODULES[id_module].AppletMain,
          id : db_entry._id
        }]
      }));
    })
  }

  /**
   * Update the properties stored in the datastore to match the properties
   *     stored in the current state, based on the id_applet provided
   * @param {string} id_applet The applet id for which to update memory
   * @nedb Updates the datastore entry with a _id of id_applet
   */
  updateAppletMemoryById(id_applet) {
    // Remove Applet props from state and unload component
    alert("porkchop " + id_applet)
    db_applets.update({_id : id_applet}, this.state.ui_props[id_applet], {});
  }

  /**
   * Remove an Applet by its id. Unload the component and remove its props from
   *     the datastore and state tree.
   * @param {string} id_applet The applet id to be removed
   * @state Removes id_applet from the keys within the state.ui_props object
   * @nedb Removes the datastore entry with a _id of id_applet
   */
  removeAppletById(id_applet) {
    // Remove Applet props from state and unload component
    this.setState(prevState => {
      let {[id_applet]:omit, ...new_ui_props} = prevState.ui_props;

      return {
        ui_props : new_ui_props,
        COMP: prevState.COMP.filter(component => component.id !== id_applet)
      }
    });

    // Remove Applet props from datastore
    db_applets.remove({ _id : id_applet }, {})
  }


  /**
   * Render Application
   */

  render() {
    const NUM = "number";
    const TEX = "text";
    //let new_applet = require("./applet_modules/MenuButton.js");

    const appPass = MODULES["dummy_applet_id"];
    //alert(9);
    //alert(this.state.ui_props["dummy_id"].properties.elements);
    // alert(JSON.stringify(this.state.ui_props["dummy_id"]));
    // let applet_module1 = MODULES[this.state.ui_props["dummy_id"].id_applet];

    return (
      <div id="app">
        <div id="content">

          {/*<div id="component">
            {this.state.COMP.map( component => component )}
          </div>*/}

          <div id="component">
            {this.state.COMP.map( component =>
              <div>
                <component.app
                id="Target"
                updateAppletMemory={() => (this.updateAppletMemoryById(component.id))}
                {...this.state.ui_props[component.id].properties}
                />
                {DEV_IDS
                  ? <div class="debug" style={{position: "element(#Target)"}}>
                      <p>{component.id}</p>
                      <p>{this.state.ui_props[component.id].id_applet}</p>
                    </div>
                  : null}
              </div>
            )}
          </div>

          {/*<div id="component">
            <appPass.MenuButton
              {...this.state} //.ui_props["dummy_id"].properties
              setMainIcon={this.setMainIcon}
              addElement={this.addElement}
              elements={this.state.ui_props["dummy_id"].properties.elements}
            />
          </div>*/}


          {/*<Draggable
            // onDrag work in concert to separate drag and click conditions
            cancel=".non-drag" // Do not respond if child buttons are dragged
            onDrag={() => this.isDragging = true}
            onClick={() => {
              this.toggleMenu();
            }}
            onStop={() => {
              if (!this.isDragging) {
                return;
              }

              this.isDragging = false;
            }}
          >
            <div id="config">
              <h2>Application Properties</h2>
              <ul>
                <li>Add element: drag a file from your computer onto the center icon.</li>
                <li>Remove element: Ctrl-Click on element to delete.</li>
              </ul>
              <table>
                <tbody>
                  <tr>
                    <td>fly out radius:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "flyOutRadius")} />
                    </td>
                  </tr>
                  <tr>
                    <td>seperation angle:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "seperationAngle")} />
                    </td>
                  </tr>
                  <tr>
                    <td>main button diam:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "mainButtonDiam")} />
                    </td>
                  </tr>
                  <tr>
                    <td>child button diam:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "childButtonDiam")} />
                    </td>
                  </tr>
                  <tr>
                    <td>stiffness:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "stiffness")} />
                    </td>
                  </tr>
                  <tr>
                    <td>damping:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "damping")} />
                    </td>
                  </tr>
                  <tr>
                    <td>rotation:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(NUM, "rotation")} />
                    </td>
                  </tr>
                  <tr>
                    <td>main button icon:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(TEX, "mainButtonIcon")} />
                    </td>
                    <td>
                      <i
                        className="fa fa-info"
                        onClick={() =>
                          this.setState(prevState => ({
                            ...prevState,
                            ui_props: {
                              ...prevState.ui_props,
                              dummy_id: {
                                ...prevState.ui_props.dummy_id,
                                properties: {
                                  ...prevState.ui_props.dummy_id.properties,
                                  mainButtonDiam: 5 }}}}))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>main button icon size:</td>
                    <td>
                      <input className="non-drag" {...this.getInputProps(TEX, "mainButtonIconSize")} />
                    </td>
                    <td>
                      <i
                        className="fa fa-info"
                        onClick={() => alert("none | lg | 2x | 3x | 4x | 5x notereallt")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>child button icon size:</td>
                    <td>
                      <input
                        className="non-drag" {...this.getInputProps(TEX, "childButtonIconSize")}
                      />
                    </td>
                    <td>
                      <i
                        className="fa fa-info"
                        onClick={() => alert("none | lg | 2x | 3x | 4x | 5x")}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Draggable>*/}
          <Draggable
            onDrag={() => this.isDragging = true}
            cancel=".non-drag"
            onClick={() => {
              this.toggleMenu();
            }}
            onStop={() => {
              if (!this.isDragging) {
                return;
              }

              this.isDragging = false;
            }}
          >
            <div id="addrem" className="notepad">
              <button
                className=""
                onClick={() =>
                  this.loadNewApplet("dummy_applet_id")
                }
              >Add MenuButton</button>
              <div>
                <p style={{"margin-bottom":0}}>Remove following id:</p>
                <div>
                  <button
                    className=""
                    onClick={() => this.removeAppletById(this.state.to_remove)}
                  >Remove MenuButton</button>
                  <input
                    className="non-drag" {...this.getRemoveApplet()}
                  />
                </div>
              </div>
              <button
                className=""
                onClick={() => alert(JSON.stringify(this.state.COMP))}
              >Test State</button>
            </div>
          </Draggable>
        </div>
      </div>
    );
  }
}


export default App
