import React from 'react';

import './AppletSettingsDialog.css'

class AppletSettings extends React.Component {
  constructor(props) {
    super(props);

    // // this.addElement = this.addElement.bind(this);
    // this.setMainIcon = this.setMainIcon.bind(this)
    // this.getInputProps = this.getInputProps.bind(this)
    // //this.addElement = this.addElement.bind(this)
    //
    this.state = {
      settings_snapshot: this.props.snapshotSettings()
    }

    // Load available Applets' modules

  }

  render() {
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
          {this.props.settings.map( (setting) =>
            <tr>
              <td><p>{setting.name || "No Name Given"}</p></td>
              <td><p>{setting.description || "No Description Given"}</p></td>
              <td><input className="non-drag" {...this.props.getInputProps('number', this.props.id_applet, setting.key)} /></td>
            </tr>
          )}
          </tbody>
        </table>
        <div className="text-example">
          <button
            className="non-drag btn_settings"
            onClick={() => {
              this.props.saveSettings()
              this.setState(prevState => ({
                settings_snapshot: this.props.snapshotSettings()
              }))
            }}
          >Commit Changes</button>
          <button
            className="non-drag btn_settings"
            onClick={() => {
              this.props.revertSettings(this.state.settings_snapshot)

              // alert(JSON.stringify(this.state.temp))
              // this.setState(prevState => ({
              //   temp: this.props.snapshotSettings()
              // }))
              //this.setState(prevState => {temp: 5})
              //this.props.revertSettings()
              }
            }
          >Revert Changes</button>
          <button
            className="non-drag btn_settings"
            onClick={() =>
              this.props.closeSettings()
            }
          >Revert and Close</button>
        </div>
      </div>
    )
  }
}

export default AppletSettings
