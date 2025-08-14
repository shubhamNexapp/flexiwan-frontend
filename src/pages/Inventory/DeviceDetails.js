import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
  FormGroup,
} from "reactstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configuration imports
import Interfaces from "./Tabs/Configurations/Interfaces";
import FirewallAndNAT from "./Tabs/Configurations/FirewallAndNAT";
import StaticRoutes from "./Tabs/Configurations/StaticRoutes";
import OSPF from "./Tabs/Configurations/OSPF";
import BGP from "./Tabs/Configurations/BGP";
import RoutingFilters from "./Tabs/Configurations/RoutingFilters";
import AdvancedRouting from "./Tabs/Configurations/AdvancesRouting";

// Status imports
import Apps from "./Tabs/Status/App";
import BGPNeighbours from "./Tabs/Status/BGPNeighbours";
import DHCP from "./Tabs/Status/DHCP";
import Policies from "./Tabs/Status/Policies";
import RoutingTables from "./Tabs/Status/RoutingTable";
import Statistic from "./Tabs/Status/Statistics";
import VRRP from "./Tabs/Status/VRRP";

// Troubleshooting imports
import Command from "./Tabs/Troubleshooting/Command";
import EdgeSettings from "./Tabs/Troubleshooting/EdgeSettings";
import Logs from "./Tabs/Troubleshooting/Logs";
import PacketTraces from "./Tabs/Troubleshooting/PacketTraces";
import RecoveryInfo from "./Tabs/Troubleshooting/RecoveryInfo";
import { putData } from "../../helpers/api";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Tabs & dropdowns config
const tabs = [
  { name: "General", hasDropdown: false },
  {
    name: "Configuration",
    hasDropdown: true,
    options: [
      "Interfaces",
      "Firewall and NAT",
      "Static Routes",
      "OSPF",
      "BGP",
      "Routing Filters",
      "Advanced Routing",
    ],
  },
  {
    name: "Status",
    hasDropdown: true,
    options: [
      "Apps",
      "BGP Neighbors",
      "DHCP",
      "Policies",
      "Routing Tables",
      "Statistic",
      "VRRP",
    ],
  },
  ,
  {
    name: "Troubleshooting",
    hasDropdown: true,
    options: [
      "Command",
      "Edge Settings",
      "Logs",
      "Packet Traces",
      "Recovery Info",
    ],
  },
];

const DeviceDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const device = state?.device;

  const [loading, setLoading] = useState(false); // was true before, now false by default

  const [formValues, setFormValues] = useState({
    _id: device?._id || "",
    OrgID: device?.org || "",
    name: device?.name || "",
    description: device?.description || "",
    isApproved: device?.isApproved || false,
  });

  const [activeTab, setActiveTab] = useState("General");
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const coordinates = device?.coords;

  const handleUpdate = async () => {
    setLoading(true); // start spinner

    const payload = {
      _id: formValues._id,
      OrgID: formValues.OrgID,
      name: formValues.name,
      description: formValues.description,
      isApproved: formValues.isApproved,
    };

    try {
      await putData(
        `devices/${formValues._id}?org=${formValues.OrgID}`,
        payload
      );
      navigate("/devices");
    } catch (error) {
      console.error("Error updating device:", error);
    } finally {
      setLoading(false); // stop spinner
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleDropdown = (tabName) => {
    setDropdownOpen((prev) => (prev === tabName ? null : tabName));
  };

  const renderTabHeader = () => (
    <Row className="mb-4">
      {tabs.map((tab) => (
        <Col key={tab.name} md="3" className="mb-2">
          {tab.hasDropdown ? (
            <Dropdown
              isOpen={dropdownOpen === tab.name}
              toggle={() => toggleDropdown(tab.name)}
            >
              <DropdownToggle block caret color="secondary">
                {tab.name}
              </DropdownToggle>
              <DropdownMenu>
                {tab.options.map((opt) => (
                  <DropdownItem
                    key={opt}
                    onClick={() => {
                      setActiveTab(opt);
                      setDropdownOpen(null);
                    }}
                  >
                    {opt}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              block
              color={activeTab === tab.name ? "primary" : "secondary"}
              onClick={() => {
                setActiveTab(tab.name);
                setDropdownOpen(null);
              }}
            >
              {tab.name}
            </Button>
          )}
        </Col>
      ))}
    </Row>
  );

  // Per-tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <Row>
            <Col md={6} className="mb-3">
              <Label for="name">Device Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleChange}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label for="description">Description</Label>
              <Input
                type="text"
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleChange}
              />
            </Col>
            {/* <Col md={6} className="mb-4">
              <Label>Approved</Label>
              <div className="form-check">
                <Input
                  type="checkbox"
                  id="isApproved"
                  name="isApproved"
                  checked={formValues.isApproved}
                  onChange={handleChange}
                />
                <Label check htmlFor="isApproved">
                  Is Approved
                </Label>
              </div>
            </Col> */}

            <FormGroup className="d-flex flex-column">
              <Label className="mb-1">Approved</Label>
              <div className="form-check form-switch">
                <input
                  id="bgpEnable"
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  defaultChecked
                  checked={formValues.isApproved}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="bgpEnable" />
              </div>
            </FormGroup>

            <Col md={12}>
              <hr />
              <h5>Read-only Information</h5>
            </Col>

            <Col md={6} className="mb-3">
              <Label>Host Name</Label>
              <Input value={device?.hostname || "N/A"} disabled />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Hardware S/N</Label>
              <Input value={device?.serial || "N/A"} disabled />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Host OS</Label>
              <Input value={device?.versions?.device || "N/A"} disabled />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Machine ID</Label>
              <Input value={device?.machineId || "N/A"} disabled />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Device Version</Label>
              <Input value={device?.versions?.agent || "N/A"} disabled />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Router Status</Label>
              <Input value={device?.deviceState || "N/A"} disabled />
            </Col>

            <Col md={12} className="mt-4">
              <Button color="primary" onClick={handleUpdate} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" /> Updating...
                  </>
                ) : (
                  "Update Device Info"
                )}
              </Button>
            </Col>

            {coordinates?.length === 2 && (
              <Col md={12} className="mt-4">
                <h5 className="mb-2">Live Location</h5>
                <div style={{ height: "300px" }}>
                  <MapContainer
                    center={coordinates}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={coordinates}>
                      <Popup>{formValues.name || "Device"}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </Col>
            )}
          </Row>
        );

      // Example: Configuration dropdown option with its own logic
      case "Interfaces":
        return <Interfaces _id={formValues._id} />;
      case "Firewall and NAT":
        return <FirewallAndNAT _id={formValues._id} />;
      case "Static Routes":
        return <StaticRoutes _id={formValues._id} />;
      case "OSPF":
        return <OSPF _id={formValues._id} />;
      case "BGP":
        return <BGP _id={formValues._id} />;
      case "Routing Filters":
        return <RoutingFilters _id={formValues._id} />;
      case "Advanced Routing":
        return <AdvancedRouting _id={formValues._id} />;

      // Example: Status dropdown option with its own logic
      case "Apps":
        return <Apps _id={formValues._id} />;
      case "BGP Neighbors":
        return <BGPNeighbours _id={formValues._id} />;
      case "DHCP":
        return <DHCP _id={formValues._id} />;
      case "Policies":
        return <Policies _id={formValues._id} />;
      case "DHCP":
      case "Routing Tables":
        return <RoutingTables _id={formValues._id} />;
      case "Statistic":
        return <Statistic _id={formValues._id} OrgID={formValues.OrgID} />;
      case "VRRP":
        return <VRRP _id={formValues._id} />;

      // Example: Troubleshooting dropdown option with its own logic
      case "Command":
        return <Command _id={formValues._id} />;
      case "Edge Settings":
        return <EdgeSettings _id={formValues._id} />;
      case "Logs":
        return <Logs _id={formValues._id} />;
      case "Packet Traces":
        return <PacketTraces _id={formValues._id} />;
      case "Recovery Info":
        return <RecoveryInfo _id={formValues._id} />;

      default:
        return <p>ℹ️ Select a tab to see content.</p>;
    }
  };

  return (
    <div className="page-content">
      {/* Back and Device Name */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button color="link" onClick={() => navigate("/devices")}>
          🔙
        </Button>
        <h4 className="fw-bold mb-0">{device?.name || "Device"}</h4>
      </div>
      {renderTabHeader()}
      {renderTabContent()}
    </div>
  );
};

export default DeviceDetails;
