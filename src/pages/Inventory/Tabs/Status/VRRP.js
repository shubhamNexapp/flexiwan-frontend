import React, { useState, useEffect } from "react";
import { Table, Spinner } from "reactstrap";
import { getData } from "../../../../helpers/api"; // Adjust path if needed

const VRRP = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [vrrpData, setVrrpData] = useState([]);

  useEffect(() => {
    const fetchVRRP = async () => {
      try {
        const response = await getData(`vrrp?deviceId=${_id}`);

        // Ensure we store data safely
        setVrrpData(response || []);
      } catch (err) {
        console.error("Error loading VRRP data", err);
      } finally {
        setLoading(false);
      }
    };

    if (_id) {
      fetchVRRP();
    }
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
              <th>Virtual Router ID</th>
              <th>Virtual IP</th>
              <th>Interface</th>
              <th>State</th>
              <th>Installation Status</th>
            </tr>
          </thead>
          <tbody>
            {vrrpData.length > 0 ? (
              vrrpData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || "-"}</td>
                  <td>{item.virtualRouterId || "-"}</td>
                  <td>{item.virtualIp || "-"}</td>
                  <td>{item.interface || "-"}</td>
                  <td>{item.state || "-"}</td>
                  <td>{item.installationStatus || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No VRRP data found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default VRRP;
