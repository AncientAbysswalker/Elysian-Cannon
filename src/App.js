// import React from 'react';
// import logo from './logo.svg';
import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;

import React from 'react';
import {Motion, spring} from 'react-motion';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

// function _extends() {
//   var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {if (window.CP.shouldStopExecution(0)) break;var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}window.CP.exitedLoop(0);return target;};return _extends.apply(this, arguments);
// } // React Motion
// let Motion = ReactMotion.Motion;
// let spring = ReactMotion.spring;

// CONSTANTS
// Value of 1 degree in radians
const DEG_TO_RAD = 0.0174533;
const ELEMENTS = [
  {
    icon: "home",
    onClick: () => alert("clicked home")
  },
  {
    icon: "clock-o",
    onClick: () => alert("clicked clock")
  },
  {
    icon: "lock",
    onClick: () => alert("clicked lock")
  },
  {
    icon: "globe",
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
function toRadians(degrees) {
  return degrees * DEG_TO_RAD;
}

// -------------------------------------------------------
// ---------------   COMPONENT START   -------------------
// -------------------------------------------------------
class MenuButton extends React.Component {
  constructor(props) {
    super(props);

    this.toggleMenu.bind(this)
    // this.onDrag.bind(this)
    // this.onStop.bind(this)
    // this.onDrop.bind(this)

    this.state = {
      isOpen: false
    };
  }

  /**
   * Toggles the main button open and closed.
   */
  toggleMenu(...args) {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  }

  // onDrop() {
  //   console.log(5)
  // }
  //
  // onDrag() {
  //   this.toggleMenu()
  //   this.setState({dragging: true})
  // }
  //
  // onStop(...args) {
  //   const {dragging} = this.state
  //   this.setState({dragging: false})
  //   if (dragging) {
  //     this.onDrop(...args)
  //   } else {
  //     this.toggleMenu(...args)
  //   }
  // }

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
        className: "button-menu",
        style: this.getMainButtonStyle(),
        // onClick: this.toggleMenu.bind(this)
        // onDrag: this.myDrag.bind(this),
        // onStop: this.myStop.bind(this)
      }),

      childButtonProps: (style, onClick) => ({
        className: "button-child",
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
        className: "child-button-icon fa fa-" + name,
        style: {
          fontSize: this.props.childButtonDiam * this.props.childButtonIconSize
        }
      }),

      mainButtonIconProps: name => ({
        className: "main-button-icon fa fa-" + name,
        style: {
          fontSize: this.props.mainButtonDiam * this.props.mainButtonIconSize
        }
      })
    };
  }

  renderChildButton(item, index) {
    let { isOpen } = this.state;
    let cp = this.getCProps();

    //return <div {...cp.childButtonProps(index, isOpen)}/>;

    return (
      <Motion {...cp.childButtonMotionProps(index, isOpen)}>
        {style => (
          <div {...cp.childButtonProps(style, item.onClick)}>
            <i {...cp.childButtonIconProps(item.icon)} />
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
        onStop={() => {
          if (!this.isDragging) {
            this.toggleMenu()
          }

          this.isDragging = false;
        }}
      >
        <div className="button-container">
          {elements.map((item, i) => this.renderChildButton(item, i))} {/* Child element buttons */}
          <div {...cp.mainButtonProps()}> {/* Button element */}
            <i {...cp.mainButtonIconProps(mainButtonIcon)} /> {/* Icon element */}
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

    this.state = {
      flyOutRadius: 120,
      seperationAngle: 40,
      mainButtonDiam: 90,
      childButtonDiam: 50,
      numElements: 4,
      stiffness: 320,
      damping: 17,
      rotation: 0,
      mainButtonIcon: "bars",
      mainButtonIconSize: 0.5,
      childButtonIconSize: 0.5
    };
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

  addElement() {
    ELEMENTS.push({
      icon: "industry",
      onClick: () => alert("clicked industry")
    });
    this.setState(prevState => ({
      numElements: prevState.numElements + 1
    }));
    console.log("added");
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
              elements={ELEMENTS.slice(0, this.state.numElements)}
            />
          </div>

          <div id="config">
            <div onClick={this.addElement.bind(this)}>ADD</div>
            <div onClick={this.removeElement.bind(this)}>REMOVE</div>
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
