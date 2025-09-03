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
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { deleteData, getData } from "../../helpers/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LoaderHide, LoaderShow } from "../../helpers/common.constants";
import loader from "../../assets/images/instaone-loader.svg";


// Global Search Input
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);

  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || undefined);
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


// Table component
function Table({ columns, data }) {
  const defaultColumn = React.useMemo(() => ({
    Filter: () => null, // Disable individual column filters
  }), []);

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
                <th key={column.id}>{column.render("Header")}</th>
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

// Main Component
function DatatableTables() {
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

  const fetchMembers = async () => {
    try {
      const response = await getData("/members");
      const formatted = response.map((member) => {
        let entity = "-";
        if (member.group) {
          entity = member.group;
        } else if (member.organization_name) {
          entity = member.organization_name;
        } else if (member.account_name) {
          entity = member.account_name;
        }

        return {
          id: member._id,
          name: member.user_name || "-",
          email: member.user_email || "-",
          permission: member.to || "-",
          entity,
          role: member.role || "-",
        };
      });

      setTableData(formatted);
    } catch (error) {
      console.error("Failed to load member data:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const deleteUser = async (id) => {
    try {
      LoaderShow()
      const response = await deleteData(`/members/${id}`, {
        method: "DELETE",
      });
      LoaderHide()
      setmodal_standard(false);
      fetchMembers()
      toast.success("Organization deleted successfully");
    } catch (error) {
      LoaderHide()
      toast.error("Error deleting organization");
      console.error("Error deleting organization:", error);
    }
  };

  const columns = React.useMemo(() => [
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Permission To", accessor: "permission" },
    { Header: "Entity", accessor: "entity" },
    { Header: "Role", accessor: "role" },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="d-flex gap-2">
          <Link
            to={`/edit-user/${row.original.id}`}
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
  ], []);

  document.title = "User List | FlexiWAN Members";

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Tables" breadcrumbItem="Users List" />
        <Row>
          <Col className="col-12">
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Users</h4>
                <Link to="/add-user">
                  <button
                    type="button"
                    className="btn btn-outline-primary waves-effect waves-light"
                  >
                    Add <i className="mdi mdi-plus-circle ms-1"></i>
                  </button>
                </Link>
              </CardHeader>
              <CardBody>
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
                onClick={() => deleteUser(selectedOrgId)}
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

export default DatatableTables;
