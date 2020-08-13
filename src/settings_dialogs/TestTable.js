import React from 'react';

import CssBaseline from '@material-ui/core/ScopedCssBaseline';
import EnhancedTable from './EnhancedTable';

const TestTable = (props) => {
  const columns = React.useMemo(
    () => [
      // I don't need to be transparent about these
      {
        Header: 'id_applet',
        accessor: 'id_applet',
        header_title: 'The id of the applet instance',
      },
      {
        Header: 'id_module',
        accessor: 'id_module',
        header_title: 'The id of the parent module',
      },
      // -----------------------------------

      {
        Header: <img src={require('./drag2.png')} alt="Girl in a jacket" width="20" height="20" />,
        accessor: 'unlocked',
        header_title: 'Whether the applet can be dragged',
      },
      {
        Header: <img src={require('./highlight.png')} alt="Girl in a jacket" width="20" height="20" />,
        accessor: 'highlighted',
        header_title: 'Whether the applet should be highlighted',
      },
      {
        Header: <img src={require('./arr_x.png')} alt="x-axis" width="20" height="20" />,
        accessor: 'x',
        header_title: 'The x-position of the applet',
      },
      {
        Header: <img src={require('./arr_y.png')} alt="x-axis" width="20" height="20" />,
        accessor: 'y',
        header_title: 'The y-position of the applet',
      },
      {
        Header: <img src={require('./ghost2.png')} alt="Girl in a jacket" width="20" height="20" />,
        accessor: 'hidden',
        header_title: 'Whether the applet should be hidden (unloaded)',
      },
      {
        Header: <img src={require('./gear1.png')} alt="Girl in a jacket" width="20" height="20" />,
        accessor: 'settings',
        header_title: 'Open applet-specific settings, if available',
      },
    ],
    []
  );

  const mapProps = (ui_props, location_props) => {
    return Object.keys(ui_props).map(id_applet => {
      const { properties:omit1, ...standard_ui_props } = ui_props[id_applet];
      const { position_root:omit2, ...standard_location_props } = location_props[id_applet];

      return {
        id_applet: id_applet,
        settings: {
          open: () => props.openSettingsById(id_applet),
          available: (props.modules[ui_props[id_applet].id_module].hasOwnProperty('settings_props')), // May need more careful checks

          //() => {return props.modules[id_applet].hasOwnProperty('settings_props')}
          // (typeof props.modules[ui_props[id_applet].id_module] !== "undefined")
          //            ? props.modules[id_applet].hasOwnProperty('settings_props')
          //            : false
        },
        remove: () => props.removeAppletById(id_applet),

        ...standard_ui_props,
        ...standard_location_props,
        ...location_props[id_applet].position_root,

      };
    });
  };

  var fs = window.require('fs');
  // fs.writeFileSync("D:\\Standard Windows Pins\\Documents\\port2.txt", JSON.stringify(mapProps(props.ui_props || {}, props.location_props || {})));
  // fs.writeFileSync("D:\\Standard Windows Pins\\Documents\\port3.txt", JSON.stringify(makeData(20)));
  //this.props.passedState.keys()

  //mapProps(props.passedState || {})
  const data = mapProps(props.ui_props || {}, props.location_props || {});//React.useState(React.useMemo(() => makeData(20), []))
  //const [data, setData] = React.useState(React.useMemo(() => makeData(20), []))
  const [skipPageReset, setSkipPageReset] = React.useState(false);

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setSkipPageReset(true);
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...old[rowIndex],
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  };

  return (
    <div>
      <CssBaseline>
        <EnhancedTable
          columns={columns}
          data={data}
          // setData={setData}
          updateMyData={updateMyData}
          skipPageReset={skipPageReset}
          state_functions={props.state_functions}
          openSettingsById={props.openSettingsById}
        />
      </ CssBaseline>
    </div>
  );
};

export default TestTable;
