import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Container, Row, Col, Card, CardBody, CardTitle } from "reactstrap";
import { getData } from "../../helpers/api"; // your existing helper

/* index.css or App.css */
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Dashboard = () => {
  document.title = "Dashboard | Minia - React Admin & Dashboard Template";

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devicesSummary, setDevicesSummary] = useState([]);
  const [devicesCordinates, setDevicesCordinates] = useState([]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await getData(
        "/organizations/summary?org=68764b74d712a564f6306593"
      );
      setSummary(response);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setLoading(false);
    }
  };

  const fetchAllDevicesSummary = async () => {
    try {
      setLoading(true);
      const response = await getData("/devices?response=summary");

      const validDevices = response
        .filter(
          (device) =>
            Array.isArray(device.coords) &&
            device.coords.length === 2 &&
            typeof device.coords[0] === "number" &&
            typeof device.coords[1] === "number"
        )
        .map((device) => ({
          coords: device.coords,
          name: device.name || "Unnamed Device",
          serial: device.serial || "N/A",
        }));

      setDevicesSummary(response);
      setDevicesCordinates(validDevices);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setLoading(false);
    }
  };

  console.log("devicesCordinates======", devicesCordinates);

  useEffect(() => {
    fetchSummary();
    fetchAllDevicesSummary();
  }, []);

  const renderCard = (label, value, iconClass, colorClass) => (
    <Col md={4} className="mb-4">
      <Card className="mini-stats-wid shadow-sm">
        <CardBody>
          <div className="d-flex">
            <div className="flex-grow-1">
              <p className="text-muted fw-medium mb-1">{label}</p>
              <h4 className="mb-0">{value}</h4>
            </div>
            <div className="avatar-sm align-self-center">
              <span
                className={`avatar-title rounded-circle bg-soft ${colorClass} text-${colorClass} fs-4`}
              >
                <i className={`bx ${iconClass}`} />
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Dashboard" />
          {!loading && summary && (
            <>
              {/* Devices Section */}
              <div className="mb-4">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Devices Summary
                    </CardTitle>
                    <Row>
                      {renderCard(
                        "Connected Devices",
                        summary.devices.connected,
                        "bx-check-circle",
                        "success"
                      )}
                      {renderCard(
                        "Approved Devices",
                        summary.devices.approved,
                        "bx-badge-check",
                        "primary"
                      )}
                      {renderCard(
                        "Running Devices",
                        summary.devices.running,
                        "bx-play-circle",
                        "info"
                      )}
                      {renderCard(
                        "Warning Devices",
                        summary.devices.warning,
                        "bx-error-circle",
                        "warning"
                      )}
                      {renderCard(
                        "Total Devices",
                        summary.devices.total,
                        "bx-devices",
                        "dark"
                      )}
                    </Row>
                  </CardBody>
                </Card>
              </div>

              {/* Tunnels Section */}
              <div className="mb-4">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Tunnels Summary
                    </CardTitle>
                    <Row>
                      {renderCard(
                        "Connected Tunnels",
                        summary.tunnels.connected,
                        "bx-link",
                        "success"
                      )}
                      {renderCard(
                        "Warning Tunnels",
                        summary.tunnels.warning,
                        "bx-error",
                        "warning"
                      )}
                      {renderCard(
                        "Unknown Tunnels",
                        summary.tunnels.unknown,
                        "bx-question-mark",
                        "secondary"
                      )}
                      {renderCard(
                        "Total Tunnels",
                        summary.tunnels.total,
                        "bx-network-chart",
                        "dark"
                      )}
                    </Row>
                  </CardBody>
                </Card>
              </div>

              {/* Traffic Section */}
              {summary.traffic?.length > 0 && (
                <div className="mb-4">
                  <Card>
                    <CardBody>
                      <CardTitle tag="h5" className="mb-3">
                        Traffic This Month
                      </CardTitle>
                      <Row>
                        <Col md={6} lg={4}>
                          <Card className="mini-stats-wid shadow-sm">
                            <CardBody>
                              <div className="d-flex">
                                <div className="flex-grow-1">
                                  <p className="text-muted fw-medium mb-1">
                                    {new Date(
                                      summary.traffic[0].month
                                    ).toLocaleString("default", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <h4 className="mb-0">
                                    {formatBytes(summary.traffic[0].bytes)}
                                  </h4>
                                  <p className="text-muted mt-2 mb-0">
                                    Devices: {summary.traffic[0].deviceCount}
                                  </p>
                                </div>
                                <div className="avatar-sm align-self-center">
                                  <span className="avatar-title rounded-circle bg-info bg-soft text-info fs-4">
                                    <i className="bx bx-bar-chart-alt-2" />
                                  </span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* Devices Map Section */}
              {devicesCordinates.length > 0 && (
                <div className="mb-4">
                  <Card>
                    <CardBody>
                      <CardTitle tag="h5" className="mb-3">
                        Device Location Map
                      </CardTitle>
                      <MapContainer
                        center={devicesCordinates[0].coords || [20, 77]}
                        zoom={5}
                        style={{ height: "400px", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="&copy; OpenStreetMap contributors"
                        />
                        {devicesCordinates.map((device, idx) =>
                          Array.isArray(device.coords) &&
                          device.coords.length === 2 &&
                          typeof device.coords[0] === "number" &&
                          typeof device.coords[1] === "number" ? (
                            <Marker key={idx} position={device.coords}>
                              <Popup>
                                <strong>{device.name}</strong>
                                <br />
                                Serial: {device.serial}
                              </Popup>
                            </Marker>
                          ) : null
                        )}
                      </MapContainer>
                    </CardBody>
                  </Card>
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
