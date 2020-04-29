import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
//import {MenuButton} from './applet_modules/MenuButton.js'

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

const Datastore = require('nedb');
let db_applets = new Datastore({
  filename : 'ui_elements_testing',
  autoload : true
});

// TESTING
const DEV_HASHES = false; //
const DEV_IDS = true;

// async function loadOnStartData(datastore, query_id) {
//   let promise = new Promise((resolve, reject) => {
//     dbFindAll(datastore, {load_on_start : true}).then(applets => {
//
//       // Eventually this needs to move 100% to the modules so there is no overlap? Each should handle it's own mapping if there is any unique mapping...
//       // This is JUST the mapping that can be handed over, and the location in state is still compartmentalized and thus safe
//       // SHOULD resolve array of state JSON objects
//       resolve(applets.map(applet => {
//         if ("propsMap" in MODULES[applet.id_applet]){
//           MODULES[applet.id_applet].propsMap(applet.properties);
//         }
//         return applet;
//       }));
//     });
//   });
//
//   return await promise;
// }

async function dbInsertApplet(datastore, state_object) {
  let promise = new Promise((resolve, reject) => {
    datastore.insert(state_object, function (err, newDoc) {   // Callback is optional
      resolve(newDoc);
    });
  });

  return await promise;
}



async function loadMenuButton(datastore, query_id) {

  let promise = new Promise((resolve, reject) => {
    dbFindOne(datastore, {ref_id : query_id}).then(a => {
      let elements = a.properties.elements.map(element => {
        element.onClick = () => { shell.openItem(element.symlink) };
        return element;
      })

      //alert(elements);
      resolve(elements);
      // alert(JSON.stringify(a.properties.elements[0].onClick));
      // alert(elements[0].onClick);
    });
  });

  return await promise;
}

async function dbFindOne(datastore, token) {

  let promise = new Promise((resolve, reject) => {
    datastore.findOne(token, (err,docs) => resolve(docs));
  });

  //db.find({year : 1990}, function (err,docs){ let result = docs;});

  return await promise;
}

async function dbFindAll(datastore, token) {

  let promise = new Promise((resolve, reject) => {
    datastore.find(token, (err,docs) => resolve(docs));
  });

  //db.find({year : 1990}, function (err,docs){ let result = docs;});

  return await promise;
}

//let a = 0;
//db.find({year : 1990}, function (err,docs){ a = docs; alert(a)});
// dbFindOne(db, {year : 1990}).then(a => alert(JSON.stringify(a)));
// alert(JSON.stringify(a));

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

      // var Datastore = require('nedb'), db = new Datastore({filename : 'guitars'});
      // db.loadDatabase();

      // alert(9);
      // db.insert({name : "fender jazz bass", year:1977});
      //db.update({year : 1977}, {name : "gibson thunderbird", year: 1990}, {});
    }
  },
  {
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
    symlink: 'https://www.google.com/',
    onClick: () => {
      shell.openItem('https://www.google.com/')
      // var Datastore = require('nedb'), db = new Datastore({filename : 'guitars'});
      // db.loadDatabase();

      // db.find({year : 1990}, function (err,docs){ alert(JSON.stringify(docs)); });
      // db.find({year : 1977}, function (err,docs){ alert(JSON.stringify(docs)); });
      // const db = require('./db.js');
      // alert(db.tags.find("pork"));
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

// db_applets.update({ref_id : "dummy_id"}, {
//   ref_id : "dummy_id",
//   name : "Circle Menu",
//   properties : {
//     "elements" : ELEMENTS
//   }});

//dbFindOne(db_applets, {ref_id : "dummy_id"}).then(a => alert(JSON.stringify(a.properties.elements[0].symlink)));

//loadMenuButton(db_applets, "dummy_id").then(a => {ELEMENTS.push(a);});

// alert(loadMenuButton(db_applets, "dummy_id"));

// db.insert({
//   applet : "MenuButton",
//   props : {"ELEMENTS" : ELEMENTS}
// });

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
// --------------   MENU BUTTON CLASS   ------------------
// -------------------------------------------------------
class MenuButton2 extends React.Component {
  constructor(props) {
    super(props);

    // Component Bindings
    this.toggleMenu.bind(this)
    this.handleDragEnter.bind(this)
    this.handleDragLeave.bind(this)
    this.handleDragOver.bind(this)
    this.handleDrop.bind(this)

    // Initial State
    this.state = {
      isOpen: false,
      isAddingItem: false
    };
  }

  /**
   * Triggers an event when a dragged item enters the element's bounding
   * @param {event} e The triggering drag-enter event
   */
  handleDragEnter(e) {
    this.setState({isAddingItem: true});
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Triggers an event when a dragged item leaves the element's bounding
   * @param {event} e The triggering drag-leave event
   */
  handleDragLeave(e) {
    this.setState({isAddingItem: false});
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Triggers an event when a dragged item is hovering over the element
   * @param {event} e The triggering drag-over event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Add a new child button when file or folder is dropped on the center button
   * @param {event} e The triggering drop event
   */
  handleDrop(e) {
    // Get the path of the dropped object and add a new child button element
    let link = e.dataTransfer.files[0].path;
    Promise.all([
      getAbsPath(link),
      getSavedIcon(link)
    ]).then(([absPath, iconPath]) => {
      this.addElement(iconPath, absPath);
    })

    // Reset CSS
    this.setState({isAddingItem: false});

    // Required to hijack activate-on-drop event
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * Append a new child button to the ELEMENTS array
   * @param {string} newIcon The path to the new button's icon
   * @param {string} newPath The path to the file, executable, etc to launch
   */
  addElement(newIcon, newPath) {
    ELEMENTS.push({
      icon: newIcon,
      onClick: () => { shell.openItem(newPath) }
    });
    this.setState({});
  }

  /**
   * Remove a child button by its index from the ELEMENTS array
   * @param {number} index The index in ELEMENTS array to remove
   */
  removeElement(index) {
    ELEMENTS.splice(index, 1);
    this.setState({});
  }

  /**
   * Toggles the main button.
   */
  toggleMenu() {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  }

  /**
   * Opens the main button.
   */
  openMenu() {
    this.setState({
      isOpen: true
    });
  }

  /**
   * Closes the main button.
   */
  closeMenu() {
    this.setState({
      isOpen: false
    });
  }

  /**
   * Returns the width and height of the main button.
   */
  getMainButtonStyle() {
    let { mainButtonDiam } = this.props;
    return {
      width: mainButtonDiam,
      height: mainButtonDiam
    };
  }

  getInitalChildButtonStyle() {
    let { childButtonDiam, mainButtonDiam, stiffness, damping } = this.props;
    return {
      width: childButtonDiam,
      height: childButtonDiam,
      zIndex: -1,
      top: spring(mainButtonDiam / 2 - childButtonDiam / 2, {
        stiffness,
        damping
      }),
      left: spring(mainButtonDiam / 2 - childButtonDiam / 2, {
        stiffness,
        damping
      })
    };
  }

  getFinalChildButtonStyle(index) {
    let { childButtonDiam, mainButtonDiam, stiffness, damping } = this.props;
    let { deltaX, deltaY } = this.getFinalDeltaPositions(index);
    return {
      width: childButtonDiam,
      height: childButtonDiam,
      zIndex: spring(0),
      top: spring(mainButtonDiam / 2 + deltaX, { stiffness, damping }),
      left: spring(mainButtonDiam / 2 - deltaY, { stiffness, damping })
    };
  }

  getFinalDeltaPositions(index) {
    let NUM_CHILDREN = this.props.elements.length;
    let CHILD_BUTTON_DIAM = this.props.childButtonDiam;
    let FLY_OUT_RADIUS = this.props.flyOutRadius;
    // let SEPARATION_ANGLE = this.props.seperationAngle;
    let SEPARATION_ANGLE = 360 / NUM_CHILDREN;
    let ROTATION = this.props.rotation;
    let FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE;
    let BASE_ANGLE = (180 - FAN_ANGLE) / 2 + 90 + ROTATION;

    let TARGET_ANGLE = BASE_ANGLE + index * SEPARATION_ANGLE;
    return {
      deltaX:
        FLY_OUT_RADIUS * Math.cos(toRadians(TARGET_ANGLE)) -
        CHILD_BUTTON_DIAM / 2,
      deltaY:
        FLY_OUT_RADIUS * Math.sin(toRadians(TARGET_ANGLE)) +
        CHILD_BUTTON_DIAM / 2
    };
  }

  getCProps() {
    return {
      mainButtonProps: () => ({
        className: "button-menu tangible",
        style: this.getMainButtonStyle(),
      }),

      childButtonProps: (style, onClick) => ({
        className: "button-child tangible",
        style,
        onClick
      }),

      childButtonMotionProps: (index, isOpen) => ({
        key: index,
        style: isOpen
          ? this.getFinalChildButtonStyle.call(this, index)
          : this.getInitalChildButtonStyle.call(this)
      }),

      // handle Icons
      childButtonIconProps: name => ({
        className: "child-button-icon tangible fa fa-",
        src: name,
        draggable: false,
        style: {
          fontSize: this.props.childButtonDiam * this.props.childButtonIconSize,
          width: this.props.childButtonDiam * this.props.childButtonIconSize,
          height: this.props.childButtonDiam * this.props.childButtonIconSize,
          "user-select": "none" // So that icon cannot be highlighted
        }
      }),

      mainButtonIconProps: name => ({
        className: "main-button-icon tangible fa fa-bars",
        src: (this.state.isAddingItem ? this.props.mainButtonIconActive
                                      : this.props.mainButtonIcon),
        draggable: false,
        style: {
          fontSize: this.props.mainButtonDiam * this.props.mainButtonIconSize,
          width: this.props.mainButtonDiam * this.props.mainButtonIconSize,
          height: this.props.mainButtonDiam * this.props.mainButtonIconSize,
          "pointer-events": "none", // So that handleDragLeave() does not trigger on entering icon
          "user-select": "none" // So that icon cannot be highlighted
        }
      })
    };
  }

  renderChildButton(item, index) {
    let { isOpen } = this.state;
    let cp = this.getCProps();

    return (
      <Motion {...cp.childButtonMotionProps(index, isOpen)}>
        {style => (
          <div {...cp.childButtonProps(style, () => {
            if (window.event.ctrlKey) {
              this.removeElement(index);
            } else {
              item.onClick()
            }
          })}>
            <img {...cp.childButtonIconProps(item.icon)} onError={(e)=>{e.target.onerror = null; e.target.src=this.src=require("./missing_icon.png")}} />
          </div>
        )}
      </Motion>
    );
  }

  render() {
    // Render the main and children buttons, and handlke dragging behaviour

    let cp = this.getCProps();
    let { elements, mainButtonIcon } = this.props;
    let isDragging = false;

    return (
      <Draggable
        // onDrag work in concert to separate drag and click conditions
        cancel=".button-child" // Do not respond if child buttons are dragged
        onDrag={() => this.isDragging = true}
        onClick={() => {
          this.toggleMenu();
        }}
        onStop={() => {
          if (!this.isDragging) {
            this.toggleMenu()
          }

          this.isDragging = false;
        }}
      >
        <div className="button-container tangible"
        onDrop={e => this.handleDrop(e)}
        onDragOver={e => this.handleDragOver(e)}
        onDragEnter={e => this.handleDragEnter(e)}
        onDragLeave={e => this.handleDragLeave(e)}
        >
          {elements.map((item, i) => this.renderChildButton(item, i))} {/* Child element buttons */}
          <div {...cp.mainButtonProps()}> {/* Button element */}
            <img {...cp.mainButtonIconProps(mainButtonIcon)} /> {/* Icon element */}
          </div>
        </div>
      </Draggable>
    );
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
  // loadAppletsOnStart() {
  //   // Pull list of stored state trees from the datastore
  //   loadOnStartData(db_applets).then(applet_state => {
  //     let state_tree = applet_state.reduce((map, obj) => {
  //       let { _id, ..._state } = obj;
  //       if (DEV_HASHES) alert(_id);
  //       map[_id] = _state;
  //       return map;//
  //     }, {});
  //
  //     // Write each stored state tree into the state.ui_props object
  //     this.setState(prevState => ({
  //       ui_props : state_tree
  //     }));
  //   }).then(() => {
  //     // Add loaded applets to array for dynamic component loading
  //     this.setState(prevState => ({
  //       COMP : Object.keys(prevState.ui_props).map(id_instance => ({
  //         app : MODULES[prevState.ui_props[id_instance].id_applet].AppletMain,
  //         id : id_instance
  //       }))
  //     }));
  //   });//
  // }

  /**
   * Load the Applets that are intended to load-on-start from the datastore. Load the user's stored
   *     state tree for each applet from the datastore into state.ui_props,
   * @param {string} resourcePath The string path of the original file or link
   * @return Adds all of the user's Applets along with their stored state trees
   *     from the datastore to the state.ui_props object
   */
  async loadOnStartData(datastore, query_id) {
    let promise = new Promise((resolve, reject) => {
      dbFindAll(datastore, {load_on_start : true}).then(applets => {

        // Eventually this needs to move 100% to the modules so there is no overlap? Each should handle it's own mapping if there is any unique mapping...
        // This is JUST the mapping that can be handed over, and the location in state is still compartmentalized and thus safe
        // SHOULD resolve array of state JSON objects
        resolve(applets.map(applet => {
          if ("propsMap" in MODULES[applet.id_applet]){
            MODULES[applet.id_applet].propsMap(applet.properties);
          }
          return applet;
        }));
      });
    });

    return await promise;
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
    dbInsertApplet(db_applets, {
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
                {...this.state.ui_props[component.id].properties}
                //elements={this.state.ui_props["dummy_id"].elements}
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
