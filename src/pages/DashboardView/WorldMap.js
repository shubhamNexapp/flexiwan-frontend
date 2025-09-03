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

const WorldMap = () => {
  document.title = "WorldMap | Minia - React Admin & Dashboard Template";

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

  useEffect(() => {
    fetchSummary();
    fetchAllDevicesSummary();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="World Map" breadcrumbItem="World Map" />
          {!loading && summary && (
            <>
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

export default WorldMap;
