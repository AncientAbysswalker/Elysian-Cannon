import React from 'react'

import CssBaseline from '@material-ui/core/ScopedCssBaseline'
import EnhancedTable from './components/EnhancedTable'
import makeData from './makeData'

const TestTable = (props) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'id_applet',
        accessor: 'id_applet',
      },
      {
        Header: 'id_module',
        accessor: 'id_module',
      },
      {
        Header: 'load_on_start',
        accessor: 'load_on_start',
      },
      {
        Header: 'x',
        accessor: 'x',
      },
      {
        Header: 'y',
        accessor: 'y',
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
      },
    ],
    []
  )

  const frank = (ui_props, location_props) => {
    return Object.keys(ui_props).map( id_applet => {
      const {properties:omit1, ...standard_ui_props} = ui_props[id_applet];
      return {
        id_applet: id_applet,
        ...standard_ui_props,
        ...location_props[id_applet].position_root
      }
    })
  }

  var fs = window.require('fs');
  // fs.writeFileSync("D:\\Standard Windows Pins\\Documents\\port2.txt", JSON.stringify(frank(props.ui_props || {}, props.location_props || {})));
  // fs.writeFileSync("D:\\Standard Windows Pins\\Documents\\port3.txt", JSON.stringify(makeData(20)));
  //this.props.passedState.keys()

  //frank(props.passedState || {})
  const data = frank(props.ui_props || {}, props.location_props || {})//React.useState(React.useMemo(() => makeData(20), []))
  //const [data, setData] = React.useState(React.useMemo(() => makeData(20), []))
  const [skipPageReset, setSkipPageReset] = React.useState(false)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setSkipPageReset(true)
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
  }

  return (
    <div>
      <CssBaseline>
        <EnhancedTable
          columns={columns}
          data={data}
          // setData={setData}
          updateMyData={updateMyData}
          skipPageReset={skipPageReset}
          funcP={(a)=>props.funcP(a)}
        />
      </ CssBaseline>
    </div>
  )
}

export default TestTable
