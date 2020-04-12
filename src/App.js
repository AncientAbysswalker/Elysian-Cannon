import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

import './App.css';

// Development build or production?
const isDev = window.require('electron-is-dev');

// Common module requirements
const fs = window.require('fs');
const path = window.require('path');
const app = window.require('electron').remote.app;
const symlink = window.require('windows-shortcuts-ps');
const md5 = require('md5');
const iconPromise = window.require('icon-promise');

// CONSTANTS
const DEG_TO_RAD = 0.0174533;
const ELEMENTS = [
  {
    icon: "https://cdn.iconscout.com/icon/free/png-256/react-2-458175.png",
    onClick: () => alert("clicked home")
  },
  {
    icon: "https://cdn.iconscout.com/icon/free/png-256/react-2-458175.png",
    onClick: () => alert("clicked home")
  },
  {
    icon: "\\logo192.png",
    onClick: () => window.open('C:\\Users\\Abysswalker\\AppData\\Local\\atom\\atom.exe')
  },
  {
    icon: "lock",
    onClick: () => {
      var child = window.require('child_process').execFile;
      var executablePath = 'C:\\Users\\Abysswalker\\AppData\\Local\\atom\\atom.exe';

      child(executablePath, function(err, data) {
          if(err){
             console.error(err);
             return;
          }

          console.log(data.toString());
      });
    }
  },
  {
    icon: "globe",
    onClick: () => window.open("https://www.w3schools.com")
  },
  {
    icon: "\\816af0c328484d2b325590aeb000ee63.png",
    onClick: () => window.open("https://www.w3schools.com")
  }
  // {
  //   icon: "asterisk",
  //   onClick: () => alert("clicked asterisk")
  // },
  // {
  //   icon: "fighter-jet",
  //   onClick: () => alert("clicked fighter-jet")
  // },
  // {
  //   icon: "clipboard",
  //   onClick: () => alert("clicked clipboard")
  // },
  // {
  //   icon: "industry",
  //   onClick: () => alert("clicked industry")
  // },
  // {
  //   icon: "industry",
  //   onClick: () => alert("clicked industry")
  // },
  // {
  //   icon: "industry",
  //   onClick: () => alert("clicked industry")
  // },
  // {
  //   icon: "industry",
  //   onClick: () => alert("clicked industry")
  // },
  // {
  //   icon: "industry",
  //   onClick: () => alert("clicked industry")
  // },
  // {
  //   icon: "industry",
  //   onClick: () => alert("clicked industry")
  // },
  // {
  //   icon: "eye",
  //   onClick: () => alert("clicked eye")
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
// ---------------   COMPONENT START   -------------------
// -------------------------------------------------------
class MenuButton extends React.Component {
  constructor(props) {
    super(props);

    this.toggleMenu.bind(this)
    this.handleDragEnter.bind(this)
    this.handleDragLeave.bind(this)
    this.handleDragOver.bind(this)
    this.handleDrop.bind(this)

    this.state = {
      isOpen: false,
      isAddingItem: false,
      specIcon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png"
    };
  }

  handleDragEnter(e) {
    this.setState({isAddingItem: true});
    // this.props.setMainIcon("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png")
    e.preventDefault();
    e.stopPropagation();
  }
  handleDragLeave(e) {
    this.setState({isAddingItem: false});
    e.preventDefault();
    e.stopPropagation();
  }
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  handleDrop(e) {
    // iconExtractor.emitter.on('icon', function(data){
    //   alert('Here is my context: ' + data.Context);
    //   alert('Here is the path it was for: ' + data.Path);
    //   alert('Here is the base64 image: ' + data.Base256ImageData);
    //
    //   fs.writeFile("O:\\False Apparition\\Desktop\\test.png", data.Base64ImageData, 'base64', function(err) {
    //     console.log(err);
    //   });
    // });
    //
    // iconExtractor.getIcon('SomeContextLikeAName',"C:\\Users\\Ancient Abysswalker\\AppData\\Local\\atom\\atom.exe");
    //
    // this.setState({isAddingItem: false});
    // alert(e.dataTransfer.files[0].context);
    var link = e.dataTransfer.files[0].path;

    // Get
    //this.props.addElement("O:\\False Apparition\\Desktop\\test.png", link)



    Promise.all([
      getAbsPath(link),
      getSavedIcon(link)
      //iconPromise.getIcon("a", link)
    ]).then(([absPath, iconPath]) => {
      this.props.addElement(iconPath, absPath);
    })
    // getAbsPath(link).then((actualPath) => alert(actualPath))
    // iconPromise.getIcon("a", link).then((actualPath) => alert(actualPath.Context))
    // ws.getPath(link).then((actualPath) => this.props.addElement("O:\\False Apparition\\Desktop\\test.png", actualPath));

    // Testing method for dropped file parameters
    //alert(...getDroppedParameters())

    // Reset CSS
    this.setState({isAddingItem: false});

    // Required to hijack activate-on-drop event
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * Toggles the main button open and closed.
   */
  toggleMenu(...args) {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
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
          <div {...cp.childButtonProps(style, item.onClick)}>
            <img {...cp.childButtonIconProps(item.icon)} onError={(e)=>{e.target.onerror = null; e.target.src=this.src=require("./sad.jpg")}} />
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
          this.toggleMenu()
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
// ----------------   COMPONENT END   --------------------
// -------------------------------------------------------


// APP
class App extends React.Component {
  constructor(props) {
    super(props);

    // this.addElement = this.addElement.bind(this);
    this.setMainIcon = this.setMainIcon.bind(this)
    this.addElement = this.addElement.bind(this)

    this.state = {
      flyOutRadius: 120,
      seperationAngle: 40,
      mainButtonDiam: 90,
      childButtonDiam: 50,
      numElements: ELEMENTS.keys().length,
      stiffness: 320,
      damping: 17,
      rotation: 0,
      mainButtonIcon: "https://cdn.iconscout.com/icon/free/png-256/react-2-458175.png",
      mainButtonIconActive: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png",
      mainButtonIconSize: 0.5,
      childButtonIconSize: 0.5
    };
  }

  setMainIcon(icon) {
    this.setState(prevState => ({
      mainButtonIcon: icon
    }));
  }

  getInputProps(type, title) {
    return {
      type: type,
      value: this.state[title],
      onChange: e =>
        type === "number"
          ? this.setState({ [title]: parseInt(e.target.value || 0, 10) })
          : this.setState({ [title]: e.target.value })
    };
  }

  addElement(newIcon, newPath) {
    ELEMENTS.push({
      icon: newIcon,
      onClick: () => {
        var child = window.require('child_process').execFile;
        const shell = window.require('electron').shell;

        shell.openItem(newPath)
        // child(newPath, function(err, data) {
        //     if(err){
        //        console.error(err);
        //        return;
        //     }
        //
        //     console.log(data.toString());
        // });
      }
    });
    this.setState({});
  }

  removeElement() {
    ELEMENTS.pop();
    this.setState(prevState => ({
      numElements: prevState.numElements - 1
    }));
    console.log("removed");
  }

  render() {
    const NUM = "number";
    const TEX = "text";

    return (
      <div id="app">
        <div id="headline">
          <h1>React Menu Button</h1>
        </div>
        {/* <button onClick={this.addElement>Click me</button> */}
        <div id="content">
          <div id="component">
            <MenuButton
              {...this.state}
              setMainIcon={this.setMainIcon}
              addElement={this.addElement}
              elements={ELEMENTS.slice(0, this.state.numElements)}
            />
          </div>

          <div id="config">
            <button type="button" className="tangible" onClick={this.addElement.bind(this)}>ADD</button>
            <button type="button" className="tangible" onClick={this.removeElement.bind(this)}>REMOVE</button>
            <h2>Props</h2>
            <table>
              <tbody>
                <tr>
                  <td>fly out radius:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "flyOutRadius")} />
                  </td>
                </tr>
                <tr>
                  <td>seperation angle:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "seperationAngle")} />
                  </td>
                </tr>
                <tr>
                  <td>main button diam:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "mainButtonDiam")} />
                  </td>
                </tr>
                <tr>
                  <td>child button diam:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "childButtonDiam")} />
                  </td>
                </tr>
                <tr>
                  <td>num elements:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "numElements")} />
                  </td>
                  <td>
                    <i
                      className="fa fa-info"
                      onClick={() =>
                        alert(
                          "normaly no number, but an array of obj {icon, onClick}"
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>stiffness:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "stiffness")} />
                  </td>
                </tr>
                <tr>
                  <td>damping:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "damping")} />
                  </td>
                </tr>
                <tr>
                  <td>rotation:</td>
                  <td>
                    <input {...this.getInputProps(NUM, "rotation")} />
                  </td>
                </tr>
                <tr>
                  <td>main button icon:</td>
                  <td>
                    <input {...this.getInputProps(TEX, "mainButtonIcon")} />
                  </td>
                  <td>
                    <i
                      className="fa fa-info"
                      onClick={() => alert("font awesome icon")}
                    />
                  </td>
                </tr>
                <tr>
                  <td>main button icon size:</td>
                  <td>
                    <input {...this.getInputProps(TEX, "mainButtonIconSize")} />
                  </td>
                  <td>
                    <i
                      className="fa fa-info"
                      onClick={() => alert("none | lg | 2x | 3x | 4x | 5x")}
                    />
                  </td>
                </tr>
                <tr>
                  <td>child button icon size:</td>
                  <td>
                    <input
                      {...this.getInputProps(TEX, "childButtonIconSize")}
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
        </div>
      </div>
    );
  }
}


export default App
