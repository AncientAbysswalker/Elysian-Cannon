import React from 'react';

import './TestSpringBox.css'

// Super gross quick static component
class AppletMain extends React.Component {
  render() {
    return (
      <div
        style={{
          width:200,
          height:200,
          "text-align":"center",
          "backgroundColor": "white",
          border: "1px solid #efefef",
          "-moz-user-select": "none",
          "-webkit-user-select": "none",
          "-ms-user-select": "none",
          "user-select": "none",
          "-o-user-select": "none"
        }}
        className="tangible"
        unselectable="on"
        onselectstart="return false;"
        onmousedown="return false;"
      >
        <p>I AM A STATIC COMPONENT</p>
      </div>
    );
  }
}

function defaultProps() {
  return {  }
}

export {AppletMain, defaultProps}
