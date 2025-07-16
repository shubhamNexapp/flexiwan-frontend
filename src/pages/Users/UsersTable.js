import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
  
import { Card, CardBody, Col, Container, Row ,CardHeader} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData } from "../../helpers/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";


// Global Search Input
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      <input
        className="form-control"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
    </span>
  );
}

// Column Filter Input
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;
  return (
    <input
      className="mt-2 form-control"
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder={`Search ${count} records...`}
    />
  );
}

// Table Component
function Table({ columns, data }) {
  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable({ columns, data, defaultColumn }, useFilters, useGlobalFilter);

  return (
    <>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <table className="table mt-3" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th key={column.id}>
                  {column.render("Header")}
                  {/* <div>{column.canFilter ? column.render("Filter") : null}</div> */}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={cell.column.id}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// Main Page
function DatatableTables() {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData("/members");

        const formattedData = response.map((member) => ({
          user_name: member.user_name || "-",
          user_email: member.user_email || "-",
          account_name: member.account_name || "-",
          role: member.role || "-",
        }));

        setTableData(formattedData);
      } catch (error) {
        toast.error(
          error?.response?.data?.error || "Failed to fetch users"
        );
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "User Name",
        accessor: "user_name",
      },
      {
        Header: "Email",
        accessor: "user_email",
      },
      {
        Header: "Account",
        accessor: "account_name",
      },
      {
        Header: "Role",
        accessor: "role",
      },
    ],
    []
  );

  document.title = "Data Tables | FlexiWAN Members";

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Tables" breadcrumbItem="Users List" />
        <Row>
          <Col className="col-12">
            <Card>
              <CardBody>
                <CardHeader>
                  <Link
                    className="nav-link dropdown-toggle arrow-none"
                    to="/add-user"
                  >
                    <button
                      type="button"
                      className="btn btn-outline-primary waves-effect waves-light"
                    >
                      Add
                      <i className="mdi mdi-plus-circle ms-1"></i>
                    </button>
                  </Link>
                  {/* <h4 className="card-title">Add Organization</h4> */}
                </CardHeader>
                <Table columns={columns} data={tableData} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DatatableTables;
