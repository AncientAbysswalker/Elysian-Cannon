import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

import './RadialMenu.css';

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
let ui_elements = new Datastore({
  filename : 'ui_elements',
  autoload : true
});

async function loadMenuButton(datastore, query_id) {

  let promise = new Promise((resolve, reject) => {
    dbFind(datastore, {ref_id : query_id}).then(a => {
      let elements = a.properties.elements.map(element => {
        element.onClick = () => { shell.openItem(element.symlink) };
        return element;
      })

      alert(elements);
      resolve(elements);
      // alert(JSON.stringify(a.properties.elements[0].onClick));
      // alert(elements[0].onClick);
    });
  });

  return await promise;
}

async function dbFind(datastore, token) {

  let promise = new Promise((resolve, reject) => {
    datastore.findOne(token, (err,docs) => resolve(docs));
  });

  //db.find({year : 1990}, function (err,docs){ let result = docs;});

  return await promise;
}

//let a = 0;
//db.find({year : 1990}, function (err,docs){ a = docs; alert(a)});
// dbFind(db, {year : 1990}).then(a => alert(JSON.stringify(a)));
// alert(JSON.stringify(a));


// CONSTANTS
const DEG_TO_RAD = 0.0174533;
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
  }
  // {
  //   icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
  //   symlink: 'https://www.google.com/',
  //   onClick: () => {
  //     shell.openItem('https://www.google.com/')
  //     // var Datastore = require('nedb'), db = new Datastore({filename : 'guitars'});
  //     // db.loadDatabase();
  //
  //     // db.find({year : 1990}, function (err,docs){ alert(JSON.stringify(docs)); });
  //     // db.find({year : 1977}, function (err,docs){ alert(JSON.stringify(docs)); });
  //     // const db = require('./db.js');
  //     // alert(db.tags.find("pork"));
  //   }
  // },
  // {
  //   icon: "https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png",
  //   symlink: 'https://reactjs.org/',
  //   onClick: () => { shell.openItem('https://reactjs.org/') }
  // },
  // {
  //   icon: "https://intentionallt_errored_search",
  //   symlink: 'https://en.wikipedia.org/wiki/Kitten',
  //   onClick: () => { shell.openItem('https://en.wikipedia.org/wiki/Kitten') }
  // }
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
// --------------   MENU BUTTON CLASS   ------------------
// -------------------------------------------------------
class AppletMain extends React.Component {
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
    this.props.elements.push({
      icon: newIcon,
      symlink: newPath,
      onClick: () => { shell.openItem(newPath) }
    });
    this.setState({});
    this.props.updateAppletMemory();
  }

  /**
   * Remove a child button by its index from the ELEMENTS array
   * @param {number} index The index in ELEMENTS array to remove
   */
  removeElement(index) {
    this.props.elements.splice(index, 1);
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
          "userSelect": "none" // So that icon cannot be highlighted
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
        <div // Main Button Element
          {...cp.mainButtonProps()} // Import props

          // Methods
          onClick={() => {this.toggleMenu()}}
          onDrop={e => this.handleDrop(e)}
          onDragOver={e => this.handleDragOver(e)}
          onDragEnter={e => this.handleDragEnter(e)}
          onDragLeave={e => this.handleDragLeave(e)}
        >
          {elements.map((item, i) => this.renderChildButton(item, i))} {/* Child element buttons */}
          <img {...cp.mainButtonIconProps(mainButtonIcon)} /> {/* Icon element */}
        </div>
    );
  }
}

function propsMap(properties) {
  properties.elements = properties.elements.map(element => {
    element.onClick = () => { shell.openItem(element.symlink) };
    return element;
  })
}

const default_props = {
  elements : [],
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
}

const name = "Radial Menu Mk0.1"

const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."



export {AppletMain, default_props, propsMap}
