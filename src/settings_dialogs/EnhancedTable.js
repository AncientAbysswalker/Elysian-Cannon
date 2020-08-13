import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import MaUTable from '@material-ui/core/Table';
import PropTypes from 'prop-types';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TablePaginationActions from './TablePaginationActions';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableToolbar from './TableToolbar';

import SettingsIcon from '@material-ui/icons/Settings';

import './EnhancedTable.css';

import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <Checkbox className="ms-checkbox" disableRipple ref={resolvedRef} {...rest} />
    );
  }
);

const inputStyle = {
  padding: 0,
  margin: 0,
  border: 0,
  background: 'transparent',
};

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  data,
  updateMyData, // This is a custom function that we supplied to our table instance
  state_functions,
}) => {
  // We need to keep and update the state of the cell normally
  //const [value, setValue] = React.useState(initialValue)

  const onChange = e => {
    // alert(index)
    // alert(id)
    // alert(JSON.stringify(data[index]))
    //setValue(e.target.value)
  };

  // We'll only update the external data when the input is blurred
  // const onBlur = () => {
  //   updateMyData(index, id, value)
  // }

  // If the initialValue is changed externall, sync it up with our state
  // React.useEffect(() => {
  //   setValue(initialValue)
  // }, [initialValue])

  return (
    (id === 'settings')
    ? (initialValue.available)
      //?<div className="en"><SettingsIcon className="pork" fontSize="large" onClick={initialValue.open}/></div>
      ? <div className="ms-image"><img className="ms-rot60" src={require('./gear1.png')} alt="Girl in a jacket" width="20" height="20" onClick={initialValue.open} /></div>//<div className="en"><img className="en" src={require("./gear1.png")} alt="Girl in a jacket" width="25" height="25" /></div>
      : <div className="ms-image"><img src={require('./gear2.png')} alt="Girl in a jacket" width="20" height="20" /></div>//<SettingsIcon className="dis"/>
    : (state_functions.hasOwnProperty(id))
      ? (typeof initialValue === 'boolean')
        ? <Switch value={state_functions[id](data[index].id_applet).checked.toString()} size="small" {...state_functions[id](data[index].id_applet)} className="non-drag" />
        : <input {...state_functions[id](data[index].id_applet)} className="non-drag" style={inputStyle} />
        //style={inputStyle}
        //value={initialValue==="dumb_box" ? "fuck" : initialValue} //Change a thing here
        // onChange={onChange}
        //onBlur={onBlur}
      : (typeof initialValue === 'boolean')
        ? <Switch size="small" checked={initialValue} disabled={true}/>
        : <p>{initialValue}</p>

  );
};

EditableCell.propTypes = {
  cell: PropTypes.shape({
    value: PropTypes.any.isRequired,
  }),
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }),
  column: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
  updateMyData: PropTypes.func.isRequired,
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
};

const EnhancedTable = ({
  columns,
  data,
  setData,
  updateMyData,
  skipPageReset,
  state_functions,
}) => {
  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize, selectedRowIds, globalFilter },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
      state_functions,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.allColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox.  Pagination is a problem since this will select all
          // rows even though not all rows are on the current page.  The solution should
          // be server side pagination.  For one, the clients should not download all
          // rows in most cases.  The client should only download data for the current page.
          // In that case, getToggleAllRowsSelectedProps works fine.
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setPageSize(Number(event.target.value));
  };

  const removeByIndexs = (array, indexs) =>
    alert(indexs);
  //array.filter((_, i) => !indexs.includes(i))

  const deleteUserHandler = event => {
    for (var row of Object.keys(selectedRowIds).map(x => parseInt(x, 10))) {
      data[row].remove();
    }
    //alert(data[0].remove)
    //alert(Object.keys(selectedRowIds).map(x => parseInt(x, 10)))
    // const newData = removeByIndexs(
    //   data,
    //   Object.keys(selectedRowIds).map(x => parseInt(x, 10))
    // )
    //setData(newData)
  };

  const addUserHandler = user => {
    const newData = data.concat([user]);
    setData(newData);
  };

  const getHeaderToolTip = (header, is_active, is_desc) => {
    const title = header + '\n'
                + (!is_active
                  ? '<Click to Sort>'
                  : (is_desc
                    ? '<Currently Sorted Descending>'
                    : '<Currently Sorted Ascending>'));
    return title;
  };

  // Render the UI for your table
  return (
    <TableContainer className="ms-table">
      <TableToolbar
        numSelected={Object.keys(selectedRowIds).length}
        deleteUserHandler={deleteUserHandler}
        addUserHandler={addUserHandler}
        preGlobalFilteredRows={preGlobalFilteredRows}
        setGlobalFilter={setGlobalFilter}
        globalFilter={globalFilter}
      />
      <MaUTable {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell align='center'
                  {...(column.id === 'selection'
                    ? column.getHeaderProps()
                    : column.getHeaderProps(column.getSortByToggleProps({
                      title: getHeaderToolTip(column.header_title, column.isSorted, column.isSortedDesc),
                    })))}
                >
                  {column.render('Header')}
                  {/*{column.id !== 'selection' ? (
                    <TableSortLabel
                      active={column.isSorted}
                      className="react-table-header"
                      // react-table has a unsorted state which is not treated here
                      direction={column.isSortedDesc ? 'desc' : 'asc'}
                    />
                  ) : null}*/}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <TableCell {...cell.getCellProps()} align='center'>
                      {cell.render('Cell')}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>


      </MaUTable>
      <TableFooter className="ms-footer">
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[
              5,
              10,
              // { label: 'All', value: data.length },
            ]}
            colSpan={3}
            count={data.length}
            rowsPerPage={pageSize}
            page={pageIndex}
            SelectProps={{
              inputProps: { 'aria-label': 'rows per page' },
              native: true,
            }}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </TableRow>
      </TableFooter>
    </TableContainer>
  );
};

EnhancedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  updateMyData: PropTypes.func.isRequired,
  setData: PropTypes.func.isRequired,
  skipPageReset: PropTypes.bool.isRequired,
};

export default EnhancedTable;
