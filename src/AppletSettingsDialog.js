import React from 'react';

import './AppletSettingsDialog.css';

class AppletSettings extends React.Component {
  constructor(props) {
    super(props);

    // // this.addElement = this.addElement.bind(this);
    // this.setMainIcon = this.setMainIcon.bind(this)
    // this.getInputProps = this.getInputProps.bind(this)
    // //this.addElement = this.addElement.bind(this)
    //
    this.state = {
      settings_snapshot: this.props.snapshotSettings(),
    };

    // Load available Applets' modules

  }

  render() {
    return (
      <div className="das-dialog">
        <table className="das-table non-drag">
          <thead>
            <tr>
             <th>Name</th>
             <th>Description</th>
             <th>Editing</th>
            </tr>
          </thead>
          <tbody>
          {this.props.settings.map((setting) =>
            <tr>
              <td><p>{setting.name || 'No Name Given'}</p></td>
              <td><p>{setting.description || 'No Description Given'}</p></td>
              <td><input {...this.props.getInputProps('number', this.props.id_applet, setting.key)} /></td>
            </tr>
          )}
          </tbody>
        </table>
        <div className="das-btn-container">
          <button
            className="non-drag das-btn"
            onClick={() => {
              this.props.saveSettings();
              this.setState(prevState => ({
                settings_snapshot: this.props.snapshotSettings(),
              }));
            }}
          >Commit Changes</button>
          <button
            className="non-drag das-btn"
            onClick={() => {
              this.props.revertSettings(this.state.settings_snapshot);
            }}
          >Revert Changes</button>
          <button
            className="non-drag das-btn"
            onClick={() => {
              this.props.saveSettings();
              this.props.closeSettings();
            }}
          >Commit and Close</button>
        </div>
      </div>
    );
  }
}

export default AppletSettings;
