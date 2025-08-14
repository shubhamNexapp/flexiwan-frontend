import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "reactstrap";
import { getData } from "../../../../helpers/api"; // adjust import if needed

const BGPNeighbours = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [neighbours, setNeighbours] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceDetails(response);

        const device = response[0];
        setNeighbours(device?.bgp?.neighbors || []);
      } catch (err) {
        console.error("Error loading BGP neighbours", err);
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
              <th>Remote IP</th>
              <th>Remote ASN</th>
              <th>UP Time</th>
              <th>Received Routes</th>
              <th>Sent Routes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {neighbours.length > 0 ? (
              neighbours.map((nbr, index) => (
                <tr key={index}>
                  <td>{nbr.remoteIP || "-"}</td>
                  <td>{nbr.remoteASN || "-"}</td>
                  <td>{nbr.upTime || "-"}</td>
                  <td>{nbr.receivedRoutes || 0}</td>
                  <td>{nbr.sentRoutes || 0}</td>
                  <td>
                    <Button
                      color="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => console.log("Edit neighbour", nbr)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => console.log("Delete neighbour", nbr)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No BGP neighbours found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default BGPNeighbours;
