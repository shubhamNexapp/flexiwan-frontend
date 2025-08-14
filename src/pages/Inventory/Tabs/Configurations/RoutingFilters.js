import React, { useEffect, useState } from "react";
import {
  Spinner,
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
} from "reactstrap";
import { getData, putData } from "../../../../helpers/api";
import cellEditFactory from "react-bootstrap-table2-editor";
import BootstrapTable from "react-bootstrap-table-next";

const RoutingFilters = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deviceDetails, setDeviceDetails] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [rules, setRules] = useState([]);

  const [showFilterCard, setShowFilterCard] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [newRoute, setNewRoute] = useState("");
  const [newAction, setNewAction] = useState("allow");
  const [newNextHop, setNewNextHop] = useState("");
  const [validationError, setValidationError] = useState("");

  const [isDirty, setIsDirty] = useState(false); // for showing update button
  const [updateLoading, setUpdateLoading] = useState(false);

  // Regex patterns
  const ipv4WithMaskRegex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\/([0-9]|[1-2][0-9]|3[0-2])$/;
  const ipv4OnlyRegex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceDetails(response);
        const filter = response[0]?.routingFilters?.[0];
        if (filter) {
          setFilterName(filter.name || "");
          setFilterDescription(filter.description || "");
          setRules(filter.rules || []);
          setShowFilterCard(true); // show card if already exists
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load device data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [_id]);

  const columns = [
    { dataField: "route", text: "Route", editable: true },
    {
      dataField: "action",
      text: "Action",
      editable: true,
      formatter: (cell) => (
        <Badge color={cell === "allow" ? "success" : "danger"}>{cell}</Badge>
      ),
    },
    { dataField: "nextHop", text: "Next Hop", editable: true },
  ];

  const handleAddRule = () => {
    // Validation
    if (!ipv4WithMaskRegex.test(newRoute)) {
      setValidationError(
        "Route must be valid IPv4 with mask (e.g. 192.168.1.0/24)"
      );
      return;
    }
    if (newNextHop && !ipv4OnlyRegex.test(newNextHop)) {
      setValidationError("Next Hop must be valid IPv4 (e.g. 192.168.1.1)");
      return;
    }

    const newRule = {
      _id: Date.now().toString(),
      route: newRoute,
      action: newAction,
      nextHop: newNextHop,
    };
    setRules([...rules, newRule]);
    setNewRoute("");
    setNewAction("allow");
    setNewNextHop("");
    setModalOpen(false);
    setValidationError("");
    setIsDirty(true); // mark changes
  };

  const handleUpdateDevice = async () => {
    if (!deviceDetails?.[0]) return;

    setUpdateLoading(true);
    try {
      const currentDevice = deviceDetails[0];

      const payload = {
        // Copy the unchanged fields from currentDevice
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
        staticroutes: currentDevice.staticroutes,

        // Replace routingFilters with updated one
        routingFilters: [
          {
            name: filterName,
            description: filterDescription,
            rules: rules,
          },
        ],
      };

      // Call your update API
      const response = await putData(`devices/${_id}`, payload);

      setIsDirty(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <Spinner className="m-4" />;
  if (error) return <p className="text-danger m-4">{error}</p>;

  return (
    <React.Fragment>
      {/* Update Button */}
      {isDirty && (
        <Button
          color="warning"
          className="mb-3"
          onClick={handleUpdateDevice}
          disabled={updateLoading}
        >
          {updateLoading ? "Updating..." : "Update Device"}
        </Button>
      )}

      {/* Add Routing Filter Button */}
      {!showFilterCard && (
        <Button
          color="primary"
          className="mb-3"
          onClick={() => setShowFilterCard(true)}
        >
          Add Routing Filter
        </Button>
      )}

      {/* Filter Card */}
      {showFilterCard && (
        <>
          <Card className="shadow-sm mb-3">
            <CardBody>
              <FormGroup>
                <Label for="filterName">Filter Name</Label>
                <Input
                  id="filterName"
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label for="filterDescription">Description</Label>
                <Input
                  id="filterDescription"
                  value={filterDescription}
                  onChange={(e) => {
                    setFilterDescription(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormGroup>
            </CardBody>
          </Card>

          {/* Add Rule Button */}
          <Button
            color="success"
            className="mb-3"
            onClick={() => setModalOpen(true)}
          >
            Add Rule
          </Button>
        </>
      )}

      {/* Rules Table */}
      <BootstrapTable
        keyField="_id"
        data={rules}
        columns={columns}
        striped
        hover
        condensed
        cellEdit={cellEditFactory({
          mode: "click",
          afterSaveCell: () => setIsDirty(true),
        })}
      />

      {/* Add Rule Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Add New Rule
        </ModalHeader>
        <ModalBody>
          {validationError && <Alert color="danger">{validationError}</Alert>}
          <FormGroup>
            <Label for="route">Route</Label>
            <Input
              id="route"
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="action">Action</Label>
            <Input
              type="select"
              id="action"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
            >
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="nextHop">Next Hop</Label>
            <Input
              id="nextHop"
              value={newNextHop}
              onChange={(e) => setNewNextHop(e.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddRule}>
            Save
          </Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default RoutingFilters;
