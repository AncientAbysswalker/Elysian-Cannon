import React from 'react';

// Super gross quick static component
class AppletMain extends React.Component {
  render() {
    return (
      <div style={{
        width:200,
        height:200,
        "text-align":"center",
        border: "1px solid #efefef"
      }} className="tangible">
        <div className="square">
          <p className="hole">I AM A STATIC COMPONENT</p>
        </div>
      </div>
    );
  }
}

function defaultProps() {
  return {  }
}

export {AppletMain, defaultProps}
