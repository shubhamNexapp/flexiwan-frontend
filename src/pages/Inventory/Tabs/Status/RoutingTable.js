import React, { useState, useEffect } from "react";
import { Table, Spinner } from "reactstrap";
import { getData } from "../../../../helpers/api"; // Adjust path if needed

const RoutingTable = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        // Example: deviceId = "6899d9ce3c853d0bbebc681f"
        const response = await getData(`devices/${_id}/routes`);

        setRoutes(response?.osRoutes || []);
      } catch (err) {
        console.error("Error loading routing table", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
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
              <th>Destination</th>
              <th>Gateway</th>
              <th>Metric</th>
              <th>Interface</th>
              <th>Protocol</th>
            </tr>
          </thead>
          <tbody>
            {routes.length > 0 ? (
              routes.map((route, index) => (
                <tr key={index}>
                  <td>{route.destination || "-"}</td>
                  <td>{route.gateway || "-"}</td>
                  <td>{route.metric ?? "-"}</td>
                  <td>{route.interface || "-"}</td>
                  <td>{route.protocol || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No routes found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default RoutingTable;
