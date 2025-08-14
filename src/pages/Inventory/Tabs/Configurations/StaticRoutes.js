import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Table,
  Spinner,
} from "reactstrap";
import { getData, putData } from "../../../../helpers/api";

const StaticRoutes = ({ _id, refreshRoutingFilters }) => {
  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [gateways, setGateways] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    destination: "",
    gateway: "",
    ifname: "",
    metric: "",
    redistributeViaOSPF: false,
    redistributeViaBGP: false,
  });

  const [showUpdateBtn, setShowUpdateBtn] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch device details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceDetails(response);
        const device = response[0];
        setRoutes(device.staticroutes || []);
        // Filter interfaces that have IPv4 & mask
        const validInterfaces = (device.interfaces || []).filter(
          (iface) => iface.IPv4 && iface.IPv4Mask
        );
        setInterfaces(validInterfaces);
        const gwSet = new Set(
          (device.staticroutes || []).map((r) => r.gateway).filter((gw) => gw)
        );
        setGateways(Array.from(gwSet));
      } catch (err) {
        console.error("Error loading device data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [_id]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setNewRoute({
      destination: "",
      gateway: "",
      ifname: "",
      metric: "",
      redistributeViaOSPF: false,
      redistributeViaBGP: false,
    });
  };

  const handleSaveRoute = () => {
    if (!newRoute.destination) return alert("Destination is required");

    setRoutes([...routes, { _id: Date.now().toString(), ...newRoute }]);
    setShowUpdateBtn(true); // Show Update Device button
    toggleModal();
  };

  const handleUpdateDevice = async () => {
    if (!deviceDetails?.[0]) return;

    setUpdateLoading(true);
    try {
      const currentDevice = deviceDetails[0];

      const payload = {
        advancedRouting: currentDevice.advancedRouting,
        bgp: currentDevice.bgp,
        description: currentDevice.description,
        deviceSpecificRulesEnabled: currentDevice.deviceSpecificRulesEnabled,
        dhcp: currentDevice.dhcp,
        firewall: currentDevice.firewall,
        interfaces: currentDevice.interfaces,
        isApproved: currentDevice.isApproved,
        name: currentDevice.name,
        ospf: currentDevice.ospf,

        // ✅ Updated static routes from local state
        staticroutes: routes,

        // ✅ Refresh routing filters from callback or existing data
        routingFilters: refreshRoutingFilters
          ? refreshRoutingFilters()
          : currentDevice.routingFilters || [],
      };

      await putData(`devices/${_id}`, payload);

      setShowUpdateBtn(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <Spinner className="m-4" />;

  return (
    <div>
      <Button color="success" className="mb-3" onClick={toggleModal}>
        Add Route
      </Button>

      {showUpdateBtn && (
        <Button
          color="primary"
          className="mb-3 ms-2"
          onClick={handleUpdateDevice}
          disabled={updateLoading}
        >
          {updateLoading ? "Updating..." : "Update Device"}
        </Button>
      )}

      {/* Static Routes Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Destination</th>
            <th>Gateway</th>
            <th>Interface</th>
            <th>Metric</th>
            <th>OSPF</th>
            <th>BGP</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route._id}>
              <td>{route.destination}</td>
              <td>{route.gateway}</td>
              <td>{route.ifname}</td>
              <td>{route.metric}</td>
              <td>{route.redistributeViaOSPF ? "Yes" : "No"}</td>
              <td>{route.redistributeViaBGP ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Route Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Add Static Route</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="destination">Destination</Label>
            <Input
              id="destination"
              value={newRoute.destination}
              onChange={(e) =>
                setNewRoute({ ...newRoute, destination: e.target.value })
              }
              placeholder="e.g., 192.168.50.0/24"
            />
          </FormGroup>

          <FormGroup>
            <Label for="gateway">Gateway IP</Label>
            <Input
              type="select"
              id="gateway"
              value={newRoute.gateway}
              onChange={(e) =>
                setNewRoute({ ...newRoute, gateway: e.target.value })
              }
            >
              <option value="">Select Gateway</option>
              {gateways.map((gw, idx) => (
                <option key={idx} value={gw}>
                  {gw}
                </option>
              ))}
            </Input>
          </FormGroup>

          {interfaces.length > 0 && (
            <FormGroup>
              <Label for="ifname">Interface</Label>
              <Input
                type="select"
                id="ifname"
                value={newRoute.ifname}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, ifname: e.target.value })
                }
              >
                <option value="">Select Interface</option>
                {interfaces.map((iface, idx) => (
                  <option key={idx} value={iface.name}>
                    {iface.name} ({iface.IPv4}/{iface.IPv4Mask})
                  </option>
                ))}
              </Input>
            </FormGroup>
          )}

          <FormGroup>
            <Label for="metric">Metric</Label>
            <Input
              id="metric"
              value={newRoute.metric}
              onChange={(e) =>
                setNewRoute({ ...newRoute, metric: e.target.value })
              }
              placeholder="e.g., 10"
            />
          </FormGroup>

          <FormGroup className="d-flex justify-content-between align-items-center">
            <Label className="mb-0">Redistribute via OSPF</Label>
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={newRoute.redistributeViaOSPF}
                onChange={(e) =>
                  setNewRoute({
                    ...newRoute,
                    redistributeViaOSPF: e.target.checked,
                  })
                }
              />
            </div>
          </FormGroup>

          <FormGroup className="d-flex justify-content-between align-items-center">
            <Label className="mb-0">Redistribute via BGP</Label>
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={newRoute.redistributeViaBGP}
                onChange={(e) =>
                  setNewRoute({
                    ...newRoute,
                    redistributeViaBGP: e.target.checked,
                  })
                }
              />
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveRoute}>
            Save
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StaticRoutes;
