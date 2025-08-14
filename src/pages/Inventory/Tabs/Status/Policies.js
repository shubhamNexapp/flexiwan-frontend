import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Badge } from "reactstrap";
import { getData } from "../../../../helpers/api"; // adjust path if needed

const Policies = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
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
                        policy.status === "active" ? "success" : "secondary"
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
                  No policies found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default Policies;
