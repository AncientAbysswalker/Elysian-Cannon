import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
import Toggle from 'react-toggle'

import './App.css';
import './react-toggle.css'

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
  filename : 'ui_applets',
  autoload : true //
});
let db_layout = new Datastore({
  filename : 'layout_data',
  autoload : true //
});

// TESTING
const DEV_ALERT_HASHES = false;
const DEV_IDS = true;
var DEV_unlocked = false;

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
      loaded_applets : [],
      temp_all_unlocked : false

    };

    // Load available Applets' modules
    this.loadAppletModules(); //.then???
    this.loadAppletsOnStart();
  }


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

  /**
   * Provide the props required to implement functionality of state-editing
   *     input boxes for applet x-positions. Populate input box with current
   *     position, and move applet to new position if value is updated
   * @param {string} id_applet The applet id to reference for position adjustment
   * @return {Object} Returns object containing necessary props
   */
  getInputPropsPositionX(applet_id) {
    return {
      value: this.state.location_props[applet_id].position_current.x,
      onChange: e => {
        let target_value = e.target.value;
        this.moveToPositionById(applet_id, {x:parseInt(target_value || 0, 10)})
    }};
  }

  /**
   * Provide the props required to implement functionality of state-editing
   *     input boxes for applet y-positions. Populate input box with current
   *     position, and move applet to new position if value is updated
   * @param {string} id_applet The applet id to reference for position adjustment
   * @return {Object} Returns object containing necessary props
   */
  getInputPropsPositionY(applet_id) {
    return {
      value: this.state.location_props[applet_id].position_current.y,
      onChange: e => {
        let target_value = e.target.value;
        this.moveToPositionById(applet_id, {y:parseInt(target_value || 0, 10)})
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
   * Load the array of Applet Modules to be available to the user and to the
   *     application as a whole.
   */
  loadAppletModules() {
    // Currently HARDCODED. TODO: Make dynamic
    let new_module = require('./applet_modules/MenuButton.js');//{MenuButton : MenuButton2};
    let new_module2 = require('./applet_modules/TestStaticBox.js');
    let new_module3 = require('./applet_modules/TestSpringBox.js');
    if (DEV_ALERT_HASHES) alert(md5(new_module.AppletMain));
    MODULES["dummy_applet_id"] = new_module;
    MODULES["dumb_box"] = new_module2;
    MODULES["spring_box"] = new_module3;
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
          if ("propsMap" in MODULES[applet.id_module]){
            MODULES[applet.id_module].propsMap(applet.properties);}
          return applet;
        }));
      });
    });

    // Get array of loaded state trees then write each tree to state.ui_props
    promise.then(applet_state => {
      let state_tree = applet_state.reduce((map, obj) => {
        let { _id, ..._state } = obj;
        if (DEV_ALERT_HASHES) alert(_id);
        map[_id] = _state;
        return map;//
      }, {});

      dbFindAll(db_layout, { _id : { $in : Object.keys(state_tree)}}).then(layouts => {
        let layout_tree = layouts.reduce((map, obj) => {
          let { _id, ..._layout } = obj;
          map[_id] = _layout;
          map[_id].position_current = map[_id].position_root;
          return map;
        }, {})

        // Write each stored state tree into the state.ui_props object
        this.setState(prevState => ({
          ui_props : state_tree,
          location_props : layout_tree
        }));
      }).then(() => {
        // Add loaded applets to array for dynamic component loading
        this.setState(prevState => ({
          loaded_applets : Object.keys(prevState.ui_props).map(id_instance => ({
            app : MODULES[prevState.ui_props[id_instance].id_module].AppletMain,
            id : id_instance
          }))
        }));
      });
    })
  }

  /**
   * Load a new Applet by its module id. Load the default state tree into state,
   *     add a datastore entry to hold the data, and load the component.
   * @param {string} id_module The module id to reference for the new Applet
   * @state Adds the default state tree provided by the module to the
   *     state.ui_props object with id_module as the key
   * @nedb Adds a datastore entry to hold the default state tree and other data
   */
  loadNewApplet(id_module) {
    // Insert the default state tree into the datastore
    dbInsert(db_applets, {
      id_module : id_module,
      load_on_start : true,
      properties : MODULES[id_module].defaultProps()
    }).then(db_entry => {
      // Insert the default location into the datastore
      dbInsert(db_layout, {
        _id : db_entry._id,
        position_root : {x : 500, y : 500},
        unlocked : false
      })

      // Insert the default state tree into state and load the component
      this.setState(prevState => ({
        ui_props : {...prevState.ui_props, ...{
          [db_entry._id] : {
            id_module : id_module,
            load_on_start : true,
            properties : MODULES[id_module].defaultProps()
        }}},
        location_props : {...prevState.location_props, ...{
          [db_entry._id] : {
            position_root : {x : 500, y : 500},
            position_current : {x : 500, y : 500},
            unlocked : false
        }}},
        loaded_applets : [...prevState.loaded_applets, {
          app : MODULES[id_module].AppletMain,
          id : db_entry._id
        }]
      }));
    })
  }

  /**
   * Update the properties stored in the datastore to match the properties
   *     stored in the current state, based on the id_module provided
   * @param {string} id_applet The applet id for which to update memory
   * @nedb Updates the datastore entry with a _id of id_applet
   */
  updateAppletMemoryById(id_applet) {
    db_applets.update({_id : id_applet}, this.state.ui_props[id_applet], {});
  }

  /**
   * Remove an Applet by its id. Unload the component and remove its props from
   *     the datastore and state.
   * @param {string} id_applet The applet id to be removed
   * @state Removes id_applet from the keys within the state tree
   * @nedb Removes the datastore entry with a _id of id_applet
   */
  removeAppletById(id_applet) {
    // Remove Applet props from state and unload component
    this.setState(prevState => {
      let {[id_applet]:omit1, ...new_ui_props} = prevState.ui_props;
      let {[id_applet]:omit2, ...new_location_props} = prevState.location_props;

      return {
        ui_props : new_ui_props,
        location_props : new_location_props,
        loaded_applets: prevState.loaded_applets.filter(component => component.id !== id_applet)
      }
    });

    // Remove Applet props from datastore
    db_applets.remove({ _id : id_applet }, {})
  }


  /**
   * Update the state and the properties stored in the datastore to match a
   *     position update due to dragging an applet, based on the id provided
   * @param {string} id_applet The applet id for which to update memory
   * @state Updates position of the applet in the state tree entry for id_applet
   * @nedb Updates through a call to updatePositionMemoryById()
   */
  updateDraggedById(id_applet) {
    // Update state to reflect the current position applet was dragget to
    this.setState(prevState => ({
      location_props : {...prevState.location_props,
        [id_applet] : {...prevState.location_props[id_applet],
          position_current : this.getPositionById(id_applet)
    }}}),

    // Update position memory after state is updated
    () => this.updatePositionMemoryById(id_applet)
  )}

  /**
   * Update the properties stored in the datastore so the applet's new load
   *     position is the applet's current position, based on the id provided
   * @param {string} id_applet The applet id for which to update memory
   * @nedb Updates the datastore entry with a _id of id_applet
   */
  updatePositionMemoryById(id_applet) {
    // Update the datastore so the future root position is the current position
    db_layout.update({_id : id_applet}, { $set: {position_root : this.state.location_props[id_applet].position_current}}, {});
  }

  /**
   * Get the current (actual) position of an applet, based on the id specified.
   *     This method calls for the actual position on screen, which may differ
   *     from state.location_props[id_applet].position_current depending on
   *     when it is called.
   * @param {string} id_applet The applet id for which to update
   * @return {Object} Returns the x,y coordinate of the applet.
   *     Example { 'x': 50, 'y': 500 }
   */
  getPositionById(id_applet) {
    return (({ x, y }) => ({ x, y }))(document.getElementById(id_applet).getBoundingClientRect());
  }

  /**
   * Move an applet to a specific coordinate provided, based on the id specified
   * @param {string} id_applet The applet id for which to update
   * @param {Object} destination The location to move the applet to. Object
   *     should contain x or y (or both) coordinates of destination. Garbage
   *     keys will be ignored. Example: { 'x': 50, 'y': 500 }
   * @state Updates position of the applet in the state tree entry for id_applet
   * @nedb Updates through a call to updatePositionMemoryById()
   */
  moveToPositionById(id_applet, destination={}) {
    // Has a new position x or y been provided?
    let new_x = destination.hasOwnProperty('x')
    let new_y = destination.hasOwnProperty('y')

    // If a new position is provided, update unlocked position state
    if (new_x || new_y) {
      this.setState(prevState => {
        let root = prevState.location_props[id_applet].position_root
        let current = prevState.location_props[id_applet].position_current

        return {
          location_props : {...prevState.location_props,
            [id_applet] : {...prevState.location_props[id_applet],
              position_root : {
                x : root.x + (new_x ? (destination.x-current.x) : 0),
                y : root.y + (new_y ? (destination.y-current.y) : 0)},
              position_current : {
                x : (new_x ? destination.x : current.x),
                y : (new_y ? destination.y : current.y)}
      }}}},

      // Then call updatePositionMemoryById() to update the datastore
      () => this.updatePositionMemoryById(id_applet)
    )}
  }


  /**
   * Toggle the locked vs unlocked state of an applet and update the datastore
   *     and state tree, based on the id_applet provided
   * @param {string} id_applet The applet id for which to update
   * @state Updates unlocked state of the state tree entry for id_applet
   * @nedb Updates unlocked state of the datastore entry with a _id of id_applet
   */
  toggleUnlockById(id_applet) {
    // Get the opposite fo the current locked/unlocked state
    let toggled = !this.state.location_props[id_applet].unlocked

    // Update unlocked state in the datastore
    db_layout.update({_id : id_applet}, { $set: {unlocked : toggled}}, {});

    // Update unlocked state in the location props state tree
    this.setState(prevState => ({
      location_props : {...prevState.location_props,
        [id_applet] : {...prevState.location_props[id_applet],
          unlocked : toggled
    }}}))
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
          <div id="component">
            {this.state.loaded_applets.map( (component, index) =>
              <Draggable
                // onDrag work in concert to separate drag and click conditions
                handle=".unlocked_handle"// Do not respond if child buttons are dragged
                onDrag={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();//
                }}
                onStop={(e) => {
                  this.updateDraggedById(component.id);//
                }}
              >
                <div
                  id={component.id}
                  className={this.state.location_props[component.id].unlocked ? "unlocked_handle" : ""}
                  style={{
                    position: "absolute",
                    left: this.state.location_props[component.id].position_root.x,
                    bottom: "auto",
                    top: this.state.location_props[component.id].position_root.y,
                    right: "auto",
                    zIndex:(4-index)
                }}>
                  <div className={this.state.location_props[component.id].unlocked ? "overlay" : ""}></div>
                  <component.app
                    updateAppletMemory={() => (this.updateAppletMemoryById(component.id))}

                    {...this.state.ui_props[component.id].properties}
                  />
                  {DEV_IDS
                    ? <div className="debug tangible">
                        <p className="tangible">{component.id}</p>
                        <p className="tangible">{this.state.ui_props[component.id].id_module}</p>
                      </div>
                    : null}
                </div>
              </Draggable>
            )}
          </div>

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
            <div id="addrem" className="notepad tangible">
              <Toggle
                defaultChecked={this.state.temp_all_unlocked}//
                icons={false}
                onChange={() => {this.setState(prevState => ({temp_all_unlocked : !prevState.temp_all_unlocked}))}}
              />
              <p className="tangible" style={{"margin-bottom":0}}>
                Add Things:
              </p>
              <div>
                <button
                  className="non-drag tangible"
                  onClick={() =>
                    this.loadNewApplet("dummy_applet_id")
                  }
                >Add MenuButton</button>
                <button
                  className="non-drag tangible"
                  onClick={() =>
                    this.loadNewApplet("dumb_box")
                  }
                >Add Static Box</button>
                <button
                  className="non-drag tangible"
                  onClick={() =>
                    this.loadNewApplet("spring_box")
                  }
                >Add Spring Box</button>
              </div>
              <p className="tangible" style={{"margin-bottom":0}}>
                Remove following id:
              </p>
              <div>
                <button
                  className="non-drag tangible"
                  onClick={() => {
                    this.removeAppletById(this.state.to_remove);
                    this.setState({to_remove : ""})
                  }}
                >Remove MenuButton</button>
                <input
                  className="non-drag tangible" {...this.getRemoveApplet()}
                />
              </div>
              <p className="tangible" style={{"margin-bottom":0}}>
                Get all positions:
              </p>
              <div>
                <button
                  className="non-drag tangible"//
                  onClick={() => {
                    // alert(document.getElementById("kImCUqTaUPttETkf").getBoundingClientRect().x);
                    // alert(document.getElementById("kImCUqTaUPttETkf").style.left);
                    // alert(this.state.location_props["kImCUqTaUPttETkf"].position.x);

                    this.moveToPositionById(this.state.to_remove)
                    //this.updatePositionMemoryById(this.state.to_remove)
                  }}
                >GET</button>
              </div>
            </div>
          </Draggable>

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
            <div id="addrem" className="notepad tangible">
              {this.state.loaded_applets.map( (component, index) =>
                <div className="inlin">
                  <p>{component.id}</p>
                  <Toggle
                    defaultChecked={this.state.location_props[component.id].unlocked}//
                    icons={false}
                    onChange={() => {
                      this.toggleUnlockById(component.id)//
                    //   this.setState(prevState => ({
                    //     location_props : {...prevState.location_props,
                    //       [component.id] : {...prevState.location_props[component.id],
                    //         unlocked : !prevState.location_props[component.id].unlocked
                    //   }}}
                    // ))
                    }}
                  />
                  <input className="non-drag" {...this.getInputPropsPositionX(component.id)} />
                  <input className="non-drag" {...this.getInputPropsPositionY(component.id)} />
                </div>
              )}
            </div>
          </Draggable>
        </div>
      </div>
    );
  }
}


export default App
