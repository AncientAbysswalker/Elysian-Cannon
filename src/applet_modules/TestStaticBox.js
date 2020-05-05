import React from 'react';

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
        <p style={{position: "absolute", margin:0, padding:0, top: "50%", "-ms-transform": "translateY(-50%)", transform: "translateY(-50%)"}}>I AM A STATIC COMPONENT</p>
      </div>
    );
  }
}

function defaultProps() {
  return {  }
}

export {AppletMain, defaultProps}
