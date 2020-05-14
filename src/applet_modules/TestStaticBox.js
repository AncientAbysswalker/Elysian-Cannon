import React from 'react';

import './TestSpringBox.css'

// Super gross quick static component
class AppletMain extends React.Component {
  render() {
    return (
      <div style={{
        width:200,
        height:200,
        "text-align":"center",
        "backgroundColor": "white",
        border: "1px solid #efefef"
      }} className="tangible">
        <p>I AM A STATIC COMPONENT</p>
      </div>
    );
  }
}

function defaultProps() {
  return {  }
}

export {AppletMain, defaultProps}
