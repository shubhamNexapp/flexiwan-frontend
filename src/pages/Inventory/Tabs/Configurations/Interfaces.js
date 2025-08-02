import React, { useState, useEffect } from "react";
import {
  Spinner,
  Table,
  Badge,
  Input,
  Label,
  FormGroup,
} from "reactstrap";
import { getData } from "../../../../helpers/api";
import "bootstrap/dist/css/bootstrap.min.css";

const DeviceOverview = ({ device }) => {
  const [selectedIface, setSelectedIface] = useState(null);
  const [selectedGW, setSelectedGW] = useState(null);

  if (!device) return <Spinner />;

  return (
   
      <Table bordered responsive hover className="align-middle text-center">
        <thead className="thead-light">
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Type</th>
            <th>Assigned</th>
            <th>IPv4</th>
            <th>GW</th>
            <th>Metric</th>
            <th>Public IP</th>
            <th>Routing</th>
          </tr>
        </thead>
        <tbody>
          {device.interfaces.map((iface) => {
            const route = device.staticroutes.find(
              (r) => r.ifname === iface.devId
            );
            return (
              <tr
                key={iface._id}
                className={selectedIface === iface._id ? "table-primary" : ""}
              >
                <td>
                  <Input
                    type="radio"
                    checked={selectedIface === iface._id}
                    onChange={() => setSelectedIface(iface._id)}
                  />
                </td>
                <td>{iface.name}</td>
                <td>{iface.type}</td>
                <td>
                  <Badge color={iface.isAssigned ? "success" : "danger"}>
                    {iface.isAssigned ? "Yes" : "No"}
                  </Badge>
                </td>
                <td>
                  {iface.IPv4 ? `${iface.IPv4}/${iface.IPv4Mask || 24}` : "-"}
                </td>
                <td>
                  {iface.gateway ? (
                    <FormGroup check inline>
                      <Label check>
                        <Input
                          type="radio"
                          checked={selectedGW === iface._id}
                          onChange={() => setSelectedGW(iface._id)}
                        />
                        {iface.gateway}
                      </Label>
                    </FormGroup>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{route?.metric || "-"}</td>
                <td>{iface.PublicIP || "n/a"}</td>
                <td>{iface.routing || "None"}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
  );
};

const DeviceInterfacePage = ({ _id }) => {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceData(response[0]);
      } catch (err) {
        setError("Failed to load device data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner className="m-4" />;
  if (error) return <p className="text-danger m-4">{error}</p>;

  return <DeviceOverview device={deviceData} />;
};

export default DeviceInterfacePage;
