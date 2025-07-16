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
  CardTitle,
  Modal,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { deleteData, getData } from "../../helpers/api.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

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
function Organizations() {
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
    const fetchData = async () => {
      try {
        const response = await getData("/organizations");

        const formattedData = response.map((organization) => ({
          id: organization._id,
          name: organization.name || "-",
          account: organization.account || "-",
          encryption_method: organization.encryptionMethod || "-",
          vxlan_port: organization.vxlanPort || "-",
          description: organization.description || "",
          group: organization.group || "",
          tunnelRange: organization.tunnelRange || "",
          encryptionMethod: organization.encryptionMethod || "ikev2",
        }));

        setTableData(formattedData);
      } catch (error) {
        // toast.error(
        //   error?.response?.data?.error || "Failed to fetch organizations"
        // );
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const deleteOrganization = async (id) => {
    try {
      const response = await deleteData(`/organizations/${id}`, {
        method: "DELETE",
      });
      setmodal_standard(false);
      fetchData()
      toast.success("Organization deleted successfully");
    } catch (error) {
      toast.error("Error deleting organization");
      console.error("Error deleting organization:", error);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Encryption Method",
        accessor: "encryption_method",
      },
      {
        Header: "Vxlan Port",
        accessor: "vxlan_port",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex gap-2">
            <Link
              to={`/edit-organization/${row.original.id}`}
              state={{ orgData: row.original }}
              className="btn btn-sm btn-warning"
            >
              Edit
            </Link>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                tog_standard(row.original.id);
              }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  document.title = "Organizations | FlexiWAN Members";

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Tables" breadcrumbItem="Organizations List" />
        <Row>
          <Col className="col-12">
            <Card>
              <CardBody>
                <CardHeader>
                  <Link
                    className="nav-link dropdown-toggle arrow-none"
                    to="/add-organizations"
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
                Modal Heading
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
              <h5>Overflowing text to show scroll behavior</h5>
              <p>
                Cras mattis consectetur purus sit amet fermentum. Cras justo
                odio, dapibus ac facilisis in, egestas eget quam. Morbi leo
                risus, porta ac consectetur ac, vestibulum at eros.
              </p>
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
                onClick={() => deleteOrganization(selectedOrgId)}
                type="button"
                className="btn btn-primary "
              >
                Save changes
              </button>
            </div>
          </Modal>
        </div>
      </Col>
    </div>
  );
}

export default Organizations;
