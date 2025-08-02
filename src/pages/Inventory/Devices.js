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
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData } from "../../helpers/api";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaStop, FaTrash } from "react-icons/fa";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  document.title = "Devices | Minia";

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await getData(
          "/devices?filters=%5B%5D&limit=18&offset=0&response=summary&sortField=name&sortOrder=asc"
        );
        setDevices(response);
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleStart = (device) => {
    console.log("Start", device.name);
    // Add your logic here
  };

  const handleStop = (device) => {
    console.log("Stop", device.name);
    // Add your logic here
  };

  const handleDelete = (device) => {
    console.log("Delete", device.name);
    // Add your logic here
  };

  const renderCard = (device) => (
    <Col lg={3} md={4} sm={6} xs={12} key={device._id} className="mb-3">
      <Card className="border shadow-sm h-100">
        <CardBody className="p-3 d-flex flex-column justify-content-between">
          <div>
            <h6
              className="mb-2 text-primary"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/device-details/${device._id}`, {
                  state: { device },
                })
              }
            >
              {device.name}
            </h6>
            <div className="mb-1">
              <small className="text-muted">Serial:</small> {device.serial}
            </div>
            <div className="mb-1">
              <Badge color={device.isConnected ? "success" : "secondary"}>
                {device.isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="mb-1">
              <small className="text-muted">Hostname:</small> {device.hostname}
            </div>
            <div className="mb-1">
              <small className="text-muted">State:</small> {device.deviceState}
            </div>
            <div className="mb-1">
              <small className="text-muted">CPU Cores:</small>{" "}
              {device.cpuInfo?.hwCores}
            </div>
            {device.interfaces?.[0] && (
              <div className="mb-1">
                <small className="text-muted">IP:</small>{" "}
                {device.interfaces[0].IPv4 || "No IP"}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-3 d-flex justify-content-between">
            <Button
              color="success"
              size="sm"
              onClick={() => handleStart(device)}
            >
              <FaPlay />
            </Button>
            <Button
              color="warning"
              size="sm"
              onClick={() => handleStop(device)}
            >
              <FaStop />
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={() => handleDelete(device)}
            >
              <FaTrash />
            </Button>
          </div>
        </CardBody>
      </Card>
    </Col>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Devices" breadcrumbItem="Devices" />
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <Row>{devices.map(renderCard)}</Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Devices;
