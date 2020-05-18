import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
import Toggle from 'react-toggle'

import TestTable from './applet_modules/TestTable.js'

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

  // settingsPropsUnlocked(applet_id) {
  //   return {
  //     value: this.state.location_props[applet_id].position_root.x,
  //     onChange: e => {
  //       let target_value = e.target.value;
  //       this.moveToPositionById(applet_id, {x:parseInt(target_value || 0, 10)})
  //   }};
  // }

  /**
   * Provide the props required to implement functionality of state-editing
   *     input boxes for applet x-positions. Populate input box with current
   *     position, and move applet to new position if value is updated
   * @param {string} id_applet The applet id to reference for position adjustment
   * @return {Object} Returns object containing necessary props
   */
  getInputPropsPositionX(applet_id) {
    return {
      value: this.state.location_props[applet_id].position_root.x,
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
      value: this.state.location_props[applet_id].position_root.y,
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
    let new_module = require('./applet_modules/RadialMenu/RadialMenu.js');//{MenuButton : MenuButton2};
    let new_module2 = require('./applet_modules/TestStaticBox.js');
    if (DEV_ALERT_HASHES) alert(md5(new_module.AppletMain));
    MODULES["dummy_applet_id"] = new_module;
    MODULES["dumb_box"] = new_module2;
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
            main : MODULES[prevState.ui_props[id_instance].id_module].AppletMain,
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
      properties : MODULES[id_module].default_props
    }).then(db_entry => {
      // Insert the default location into the datastore
      dbInsert(db_layout, {
        _id : db_entry._id,
        position_root : {x : 500, y : 500},
        depth : 0,
        unlocked : false,
        highlighted : false
      })

      // Insert the default state tree into state and load the component
      this.setState(prevState => ({
        ui_props : {...prevState.ui_props, ...{
          [db_entry._id] : {
            id_module : id_module,
            load_on_start : true,
            properties : MODULES[id_module].default_props
        }}},
        location_props : {...prevState.location_props, ...{
          [db_entry._id] : {
            position_root : {x : 500, y : 500},
            depth : 0,
            unlocked : false,
            highlighted : false
        }}},
        loaded_applets : [...prevState.loaded_applets, {
          main : MODULES[id_module].AppletMain,
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
        loaded_applets: prevState.loaded_applets.filter(applet => applet.id !== id_applet)
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
  updateDraggedById(e, new_position, id_applet) {
    //Update state to reflect the current position applet was dragged to
    const {x, y} = new_position

    this.setState(prevState => ({
      location_props : {...prevState.location_props,
        [id_applet] : {...prevState.location_props[id_applet],
          position_root : {x, y}
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
    // Update the datastore to reflect the current position
    db_layout.update({_id : id_applet}, { $set: {position_root : this.state.location_props[id_applet].position_root}}, {});
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

        return {
          location_props : {...prevState.location_props,
            [id_applet] : {...prevState.location_props[id_applet],
              position_root : {
                x : new_x ? destination.x : root.x,
                y : new_y ? destination.y : root.y
        }}}}
      },

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
    // Get the opposite of the current locked/unlocked state
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

  toggleHighlightById(id_applet) {
    // Get the opposite of the current highlighted state
    let toggled = !this.state.location_props[id_applet].highlighted

    // Update highlighted state in the datastore
    db_layout.update({_id : id_applet}, { $set: {highlighted : toggled}}, {});

    // Update highlighted state in the location props state tree
    this.setState(prevState => ({
      location_props : {...prevState.location_props,
        [id_applet] : {...prevState.location_props[id_applet],
          highlighted : toggled
    }}}))
  }

  stateFunctions() {
    return {
      x: (id) => this.getInputPropsPositionX(id),
      y: (id) => this.getInputPropsPositionY(id),
      unlocked: (id) => ({
        checked: this.state.location_props[id].unlocked,
        onChange: (e) => this.toggleUnlockById(id)
      }),
      highlighted: (id) => ({
        checked: this.state.location_props[id].highlighted,
        onChange: (e) => this.toggleHighlightById(id)
      })
  }}


  /**
   * Render Application
   */

  render() {


    return (
      <div id="app" className="intangible">
        <div id="content" className="intangible">
          <div id="component" className="intangible">
            {this.state.loaded_applets.map( (applet, index) =>
              <div // Force all applets to call (0,0) home (relative to browser)
                className="intangible"
                style={{position: 'absolute', top:0, left:0, zIndex:this.state.location_props[applet.id].depth}}
              >
                <Draggable // Enable dragability of the contained elements

                  handle=".unlocked_handle" // Classname to act as drag handle
                  onStop={(e, new_pos) => this.updateDraggedById(e, new_pos, applet.id)}
                  position={this.state.location_props[applet.id].position_root}
                >
                  <div // Acts as drag handle
                    id={applet.id}
                    className={this.state.location_props[applet.id].unlocked ? "unlocked_handle" : ""}
                  >
                    <div // Acts as outline when selected
                      className={this.state.location_props[applet.id].highlighted ? "outline" : ""}
                    />
                    <div // Acts as highlight when selected
                      className={this.state.location_props[applet.id].highlighted ? "highlight" : ""}
                    />
                    <applet.main // The actual loaded applet
                      {...this.state.ui_props[applet.id].properties} // Import props from state

                      // Pass methods from controller to applet
                      updateAppletMemory={() => (this.updateAppletMemoryById(applet.id))}
                    />
                    {DEV_IDS
                      ? <div className="debug">
                          <p>{applet.id}</p>
                          <p>{this.state.ui_props[applet.id].id_module}</p>
                        </div>
                      : null}
                  </div>
                </Draggable>
              </div>
            )}
          </div>

          <Draggable

            onDrag={() => this.isDragging = true}
            cancel=".non-drag"
            onClick={() => {
              this.toggleMenu();
            }}
            onStop={(e) => {
              if (!this.isDragging) {
                return;
              }

              this.isDragging = false;
              e.preventDefault()
            }}
          >
            <div id="addrem" className="notepad">
              <p style={{"margin-bottom":0}}>
                Add Things:
              </p>
              <div>
                <button
                  className="non-drag"
                  onClick={() =>
                    this.loadNewApplet("dummy_applet_id")
                  }
                >Add MenuButton</button>
                <button
                  className="non-drag"
                  onClick={() =>
                    this.loadNewApplet("dumb_box")
                  }
                >Add Static Box</button>
              </div>
              <p style={{"margin-bottom":0}}>
                Remove following id:
              </p>
              <div>
                <button
                  className="non-drag"
                  onClick={() => {
                    this.removeAppletById(this.state.to_remove);
                    this.setState({to_remove : ""})
                  }}
                >Remove MenuButton</button>
                <input
                  className="non-drag" {...this.getRemoveApplet()}
                />
              </div>
            </div>
          </Draggable>

          <div // Force all applets to call (0,0) home (relative to browser)
            className="intangible"
            style={{position: 'absolute', top:0, left:0}}
          >
            <Draggable
              defaultPosition={{x: 200, y: 150}}
              cancel=".non-drag"
            >
              <div id="addrem" className="notepad">
                {this.state.loaded_applets.map( (applet, index) =>
                  <div className="inlin">
                    <p>{applet.id}</p>
                    <Toggle
                      className="non-drag"
                      defaultChecked={this.state.location_props[applet.id].unlocked}
                      icons={false}
                      onChange={() => this.toggleUnlockById(applet.id)}
                    />
                    <Toggle
                      className="non-drag"
                      defaultChecked={this.state.location_props[applet.id].highlighted}
                      icons={false}
                      onChange={() => this.toggleHighlightById(applet.id)}
                    />
                    <input className="non-drag" {...this.getInputPropsPositionX(applet.id)} />
                    <input className="non-drag" {...this.getInputPropsPositionY(applet.id)} />
                    <input className="non-drag" value={this.state.location_props[applet.id].depth} />
                  </div>
                )}
              </div>
            </Draggable>
          </div>

          <div // Force all applets to call (0,0) home (relative to browser)
            className="intangible"
            style={{position: 'absolute', top:0, left:0}}
          >
            <Draggable // Enable dragability of the contained elements
              cancel=".non-drag"
              //handle=".unlocked_handle" // Classname to act as drag handle
              defaultPosition={{x: 500, y: 250}}
            >
              <div // Acts as drag handle
                className="unlocked_handle"
              >
                <TestTable ui_props={this.state.ui_props} location_props={this.state.location_props} state_functions={this.stateFunctions()} />
              </div>
            </Draggable>
          </div>
        </div>
      </div>
    );
  }
}


export default App
