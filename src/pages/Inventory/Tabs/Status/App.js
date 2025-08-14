import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "reactstrap";
import { getData } from "../../../../helpers/api"; // Adjust path if needed

const Apps = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceDetails(response);
        const device = response[0];

        setApplications(device.applications || []);
      } catch (err) {
        console.error("Error loading applications", err);
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
              <th>Application</th>
              <th>Status</th>
              <th>Installed Version</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.name || "-"}</td>
                  <td>{app.status || "-"}</td>
                  <td>{app.installedVersion || "-"}</td>
                  <td>
                    <Button
                      color="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => console.log("Edit app", app)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => console.log("Delete app", app)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default Apps;
