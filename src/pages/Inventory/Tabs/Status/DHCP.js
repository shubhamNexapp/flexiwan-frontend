import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "reactstrap";
import { getData } from "../../../../helpers/api"; // Adjust path if needed

const DHCP = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [dhcpData, setDhcpData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceDetails(response);

        const device = response[0];
        // Adjust if your API returns DHCP differently
        if (Array.isArray(device?.dhcp)) {
          setDhcpData(device.dhcp);
        } else if (device?.dhcp?.pools) {
          setDhcpData(device.dhcp.pools);
        } else {
          setDhcpData([]);
        }
      } catch (err) {
        console.error("Error loading DHCP data", err);
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
              <th>Interface</th>
              <th>IP Range</th>
              <th>DNS</th>
              <th>MAC Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dhcpData.length > 0 ? (
              dhcpData.map((dhcp, index) => (
                <tr key={index}>
                  <td>{dhcp.interface || "-"}</td>
                  <td>{dhcp.ipRange || "-"}</td>
                  <td>
                    {Array.isArray(dhcp.dns)
                      ? dhcp.dns.join(", ")
                      : dhcp.dns || "-"}
                  </td>
                  <td>{dhcp.macAssigned || "-"}</td>
                  <td>
                    <Button
                      color="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => console.log("Edit DHCP", dhcp)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => console.log("Delete DHCP", dhcp)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No DHCP data found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default DHCP;
