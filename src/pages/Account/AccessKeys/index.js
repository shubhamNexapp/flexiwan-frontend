import React, { useEffect, useState } from "react";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  CardHeader,
  Modal,
} from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import loader from "../../../assets/images/instaone-loader.svg";
import { deleteData, getData } from "../../../helpers/api.js";
import { LoaderHide, LoaderShow } from "../../../helpers/common.constants.js";

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
function AccessKeys() {
  const [tableData, setTableData] = useState([]);
  const [modal_standard, setmodal_standard] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  function removeBodyCss() {
    document.body.classList.add("no_padding");
  }

  function tog_standard(id) {
    setmodal_standard(!modal_standard);
    setSelectedOrgId(id);
    removeBodyCss();
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      LoaderShow();
      const response = await getData("/accesstokens");
      LoaderHide();
      const formattedData = response.map((access) => ({
        id: access._id,
        name: access.name,
        key: access.token,
        to: access.to || "-",
        role: access.role || "-",
      }));

      setTableData(formattedData);
    } catch (error) {
      LoaderHide();
      console.error("Error fetching data:", error);
    }
    LoaderHide();
  };

  const deleteToken = async (id) => {
    try {
      LoaderShow();
      const response = await deleteData(`/accesstokens/${id}`, {
        method: "DELETE",
      });
      setmodal_standard(false);
      LoaderHide();
      fetchData()
      toast.success("Access key deleted successfully");
    } catch (error) {
      LoaderHide();
      toast.error("Error deleting organization");
      console.error("Error deleting accesstoken:", error);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Key",
        accessor: "key",
        Cell: ({ value }) => (
          <div
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              wordBreak: "break-all",
            }}
          >
            {value}
          </div>
        ),
      },
      {
        Header: "To",
        accessor: "to",
      },
      {
        Header: "Role",
        accessor: "role",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex flex-column flex-md-row gap-2">
            {/* <button className="btn btn-sm btn-danger">Delete</button>
            <button className="btn btn-sm btn-secondary">Copy</button> */}
            <i
              className="mdi mdi-content-copy"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigator.clipboard.writeText(row.original.key);
                toast.success("Token copied to clipboard!");
              }}
            ></i>
            <i
              className="mdi mdi-delete"
              style={{ cursor: "pointer" }}
              onClick={() => tog_standard(row.original.id)}
            ></i>
          </div>
        ),
      },
    ],
    []
  );

  document.title = "Organizations | FlexiWAN Members";

  return (
    <div className="page-content">
      <div
        id="hideloding"
        className="loding-display"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255,255,255,0.7)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          display: "flex",
        }}
      >
        <img
          src={loader}
          alt="loader-img"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <Container fluid>
        <Breadcrumbs title="Tables" breadcrumbItem="Access Keys List" />
        <Row>
          <Col className="col-12">
            <Card>
              <CardBody>
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <h4 className="card-title mb-0">Acces Keys</h4>
                  <Link
                    className="nav-link dropdown-toggle arrow-none"
                    to="/add-accesskey"
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
      <Col lg={6}>
        <div>
          <Modal
            isOpen={modal_standard}
            toggle={() => {
              tog_standard();
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title mt-0" id="myModalLabel">
                Delete Access Key
              </h5>
              <button
                type="button"
                onClick={() => {
                  setmodal_standard(false);
                }}
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {/* <h5>Overflowing text to show scroll behavior</h5> */}
              <p>Are you sure to delete access key?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  tog_standard();
                }}
                className="btn btn-secondary "
                data-dismiss="modal"
              >
                Close
              </button>
              <button
                onClick={() => deleteToken(selectedOrgId)}
                type="button"
                className="btn btn-primary "
              >
                Delete
              </button>
            </div>
          </Modal>
        </div>
      </Col>
    </div>
  );
}

export default AccessKeys;
