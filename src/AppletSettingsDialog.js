import React from 'react';

import './AppletSettingsDialog.css'

const AppletSettings = (props) => {
  return (
    <div className="notepad">
      <table className="porkchop">
        <thead>
          <tr>
           <th>Name</th>
           <th>Description</th>
           <th>Editing</th>
          </tr>
        </thead>
        <tbody>
        {props.settings.map( (setting) =>
          <tr>
            <td><p>{setting.name || "No Name Given"}</p></td>
            <td><p>{setting.description || "No Description Given"}</p></td>
            <td><input className="non-drag" {...props.getInputProps('number', props.id_applet, setting.key)} /></td>
          </tr>
        )}
        </tbody>
      </table>
      <div className="text-example">
        <button
          className="non-drag btn_settings"
          onClick={() =>
            alert("pert")
          }
        >Commit Changes</button>
        <button
          className="non-drag btn_settings"
          onClick={() =>
            alert("pert")
          }
        >Revert Changes</button>
      </div>
    </div>
  )
}

export default AppletSettings
