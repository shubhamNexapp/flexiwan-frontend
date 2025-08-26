import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Spinner,
  Badge,
  Button,
  Table,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData } from "../../helpers/api";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaStop, FaTrash } from "react-icons/fa";

const Peers = ({_id}) => {
  document.title = "Peers | Minia";

  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`peers`);
        setDeviceDetails(response);

        const device = response[0];
        setPolicies(device?.policies || []);
      } catch (err) {
        console.error("Error loading policies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [_id]);

  if (loading) {
    return <Spinner className="m-4" />;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Peers" breadcrumbItem="Peers" />
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length > 0 ? (
                    policies.map((policy, index) => (
                      <tr key={index}>
                        <td>{policy.name || "-"}</td>
                        <td>{policy.type || "-"}</td>
                        <td>{policy.description || "-"}</td>
                        <td>
                          <Badge
                            color={
                              policy.status === "active"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {policy.status || "-"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            className="me-2"
                            onClick={() => console.log("Edit policy", policy)}
                          >
                            Edit
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => console.log("Delete policy", policy)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No peers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Peers;
