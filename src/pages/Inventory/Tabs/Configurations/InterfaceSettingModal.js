import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Collapse,
  Row,
  Col,
  Table,
  Container,
} from "reactstrap";

const InterfaceSettingsModal = ({ isOpen, toggle, iface }) => {
  const [formData, setFormData] = useState({});
  const [showDhcpServer, setShowDhcpServer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVLAN, setShowVLAN] = useState(false);
  const [staticAssignments, setStaticAssignments] = useState([]);
  const [newStatic, setNewStatic] = useState({
    host: "",
    mac: "",
    ipv4: "",
    useHostname: false,
  });

  const [dhcpOptions, setDhcpOptions] = useState([]);
  const [newOption, setNewOption] = useState({
    option: "",
    code: "",
    value: "",
  });

  // At the top of the component
  const [vlanSubinterfaces, setVlanSubinterfaces] = useState([]);
  const [newVlan, setNewVlan] = useState({
    tag: "",
    type: "",
    mode: "", // DHCP or Static
    ipv4: "",
    gateway: "",
  });

  useEffect(() => {
    if (iface) {
      setFormData({ ...iface });
      setShowDhcpServer(!!iface.dhcpServer); // toggle DHCP section
    }
  }, [iface]);

  console.log("iface======",iface)

  // Handle changes to VLAN form inputs
  const handleVlanInputChange = (e) => {
    const { name, value } = e.target;
    setNewVlan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add VLAN
  const handleAddVlan = () => {
    if (!newVlan.tag || !newVlan.type || !newVlan.mode || !newVlan.ipv4) {
      alert("Please fill all required fields.");
      return;
    }
    setVlanSubinterfaces([...vlanSubinterfaces, newVlan]);
    setNewVlan({ tag: "", type: "", mode: "", ipv4: "", gateway: "" });
  };

  // Delete single VLAN
  const handleDeleteVlan = (index) => {
    const updated = [...vlanSubinterfaces];
    updated.splice(index, 1);
    setVlanSubinterfaces(updated);
  };

  // Delete all VLANs
  const handleDeleteAllVlans = () => {
    setVlanSubinterfaces([]);
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  if (!iface) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOption((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    if (!newOption.option || !newOption.code || !newOption.value) {
      alert("Please fill all fields.");
      return;
    }
    setDhcpOptions([...dhcpOptions, newOption]);
    setNewOption({ option: "", code: "", value: "" });
  };

  const handleDelete = (index) => {
    const updated = [...dhcpOptions];
    updated.splice(index, 1);
    setDhcpOptions(updated);
  };

  const handleDeleteAll = () => {
    setDhcpOptions([]);
  };

  const handleInputChangeStatic = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStatic((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddStatic = () => {
    const { host, mac, ipv4 } = newStatic;
    if (!host || !mac || !ipv4) {
      alert("Please fill all fields (except checkbox).");
      return;
    }

    setStaticAssignments([...staticAssignments, newStatic]);
    setNewStatic({ host: "", mac: "", ipv4: "", useHostname: false });
  };

  const handleDeleteStatic = (index) => {
    const updated = [...staticAssignments];
    updated.splice(index, 1);
    setStaticAssignments(updated);
  };

  const handleDeleteAllStatic = () => {
    setStaticAssignments([]);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>Edit {iface.name}</ModalHeader>

      <ModalBody>
        <Form>
          <Row>
            <Col md={3}>
              <FormGroup>
                <Label for="assigned">Assigned</Label>
                <Input
                  type="select"
                  id="assigned"
                  value={formData.assigned || "No"}
                  onChange={handleChange}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={5}>
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="type">Type</Label>
                <Input
                  type="select"
                  id="type"
                  value={formData.type || ""}
                  onChange={handleChange}
                >
                  <option value="LAN">LAN</option>
                  <option value="WAN">WAN</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <FormGroup>
                <Label for="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={formData.IPv4Display || ""}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="mtu">MTU</Label>
                <Input
                  id="mtu"
                  value={formData.mtu || ""}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="dhcpStatic">DHCP/Static</Label>
                <Input
                  type="select"
                  id="dhcpStatic"
                  value={formData.dhcpStatic || "Static"}
                  onChange={handleChange}
                >
                  <option value="Static">Static</option>
                  <option value="DHCP">DHCP</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="mac">MAC</Label>
            <Input id="mac" value={formData.MAC || ""} readOnly />
          </FormGroup>

          {/* DHCP Server Section */}
          <Button
            color="link"
            className="px-0"
            onClick={() => setShowDhcpServer(!showDhcpServer)}
          >
            DHCP Server {showDhcpServer ? "▲" : "▼"}
          </Button>

          <Collapse isOpen={showDhcpServer}>
            <div className="border p-3 mt-2">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="interface">Interface</Label>
                    <Input
                      id="interface"
                      value={formData.interface || ""}
                      readOnly
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label for="ipRangeStart">IP Range Start</Label>
                    <Input
                      id="ipRangeStart"
                      value={formData.ipRangeStart || ""}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="ipRangeEnd">IP Range End</Label>
                    <Input
                      id="ipRangeEnd"
                      value={formData.ipRangeEnd || ""}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="dnsServers">DNS Servers</Label>
                    <Input
                      id="dnsServers"
                      value={formData.dnsServers || ""}
                      onChange={handleChange}
                      placeholder="e.g. 8.8.8.8, 8.8.4.4"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="defaultLease">Default Lease Time</Label>
                    <Input
                      id="defaultLease"
                      value={formData.defaultLease || ""}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="maxLease">Max Lease Time</Label>
                    <Input
                      id="maxLease"
                      value={formData.maxLease || ""}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Static Assignments Table */}
              <Container className="p-4 border mt-3 rounded">
                <h5>Static Assignments</h5>

                {/* Add New Entry */}
                <Row className="mb-3">
                  <Col md={3}>
                    <FormGroup>
                      <Label>Host</Label>
                      <Input
                        type="text"
                        name="host"
                        value={newStatic.host}
                        onChange={handleInputChangeStatic}
                        placeholder="Enter Host"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>MAC</Label>
                      <Input
                        type="text"
                        name="mac"
                        value={newStatic.mac}
                        onChange={handleInputChangeStatic}
                        placeholder="Enter MAC"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>IPv4</Label>
                      <Input
                        type="text"
                        name="ipv4"
                        value={newStatic.ipv4}
                        onChange={handleInputChangeStatic}
                        placeholder="Enter IPv4"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup check className="mt-4">
                      <Label check>
                        <Input
                          type="checkbox"
                          name="useHostname"
                          checked={newStatic.useHostname}
                          onChange={handleInputChangeStatic}
                        />{" "}
                        Use Hostname
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <Button color="primary" size="sm" onClick={handleAddStatic}>
                      Add
                    </Button>
                  </Col>
                </Row>

                {/* Table */}
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Host</th>
                      <th>MAC</th>
                      <th>IPv4</th>
                      <th>Use Hostname</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticAssignments.length > 0 ? (
                      staticAssignments.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.host}</td>
                          <td>{item.mac}</td>
                          <td>{item.ipv4}</td>
                          <td className="text-center">
                            <Input
                              type="checkbox"
                              checked={item.useHostname}
                              disabled
                            />
                          </td>
                          <td>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteStatic(idx)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No static assignments added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <Button
                  color="danger"
                  size="sm"
                  onClick={handleDeleteAllStatic}
                >
                  Delete All Static Assignments
                </Button>
              </Container>

              {/* DHCP Options Table */}
              <Container className="p-4 border mt-3 rounded">
                <h5>DHCP Options</h5>

                {/* Add New Entry */}
                <Row className="mb-3">
                  <Col md={3}>
                    <FormGroup>
                      <Label>Option</Label>
                      <Input
                        type="text"
                        name="option"
                        value={newOption.option}
                        onChange={handleInputChange}
                        placeholder="Enter Option"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Code</Label>
                      <Input
                        type="text"
                        name="code"
                        value={newOption.code}
                        onChange={handleInputChange}
                        placeholder="Enter Code"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Value</Label>
                      <Input
                        type="text"
                        name="value"
                        value={newOption.value}
                        onChange={handleInputChange}
                        placeholder="Enter Value"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button color="primary" size="sm" onClick={handleAdd}>
                      Add
                    </Button>
                  </Col>
                </Row>

                {/* Table */}
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Code</th>
                      <th>Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dhcpOptions.length > 0 ? (
                      dhcpOptions.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.option}</td>
                          <td>{item.code}</td>
                          <td>{item.value}</td>
                          <td>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(idx)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No DHCP options added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <Button color="danger" size="sm" onClick={handleDeleteAll}>
                  Delete All DHCP
                </Button>
              </Container>
            </div>
          </Collapse>

          {/* Advanced Options Section */}
          <Button
            color="link"
            className="px-0"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced Options {showAdvanced ? "▲" : "▼"}
          </Button>

          <Collapse isOpen={showAdvanced}>
            <FormGroup>
              <Label for="routing">Routing</Label>
              <Input
                id="routing"
                type="select"
                value={formData.routing || ""}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="OSPF">OSPF</option>
                <option value="BGP">BGP</option>
              </Input>
            </FormGroup>
          </Collapse>

          {/* Advanced Options Section */}
          <Button
            color="link"
            className="px-0"
            onClick={() => setShowVLAN(!showVLAN)}
          >
            VLAN sub-interfaces {showVLAN ? "▲" : "▼"}
          </Button>

          <Collapse isOpen={showVLAN}>
            <Container className="p-4 border mt-3 rounded">
              <h5>VLAN Subinterfaces</h5>

              {/* Add New Entry */}
              <Row className="mb-3">
                <Col md={2}>
                  <FormGroup>
                    <Label>Tag</Label>
                    <Input
                      type="text"
                      name="tag"
                      value={newVlan.tag}
                      onChange={handleVlanInputChange}
                      placeholder="Enter VLAN Tag"
                    />
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup>
                    <Label>Type</Label>
                    <Input
                      type="text"
                      name="type"
                      value={newVlan.type}
                      onChange={handleVlanInputChange}
                      placeholder="Enter Type"
                    />
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup>
                    <Label>Mode</Label>
                    <Input
                      type="select"
                      name="mode"
                      value={newVlan.mode}
                      onChange={handleVlanInputChange}
                    >
                      <option value="">Select</option>
                      <option value="DHCP">DHCP</option>
                      <option value="Static">Static</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>IPv4</Label>
                    <Input
                      type="text"
                      name="ipv4"
                      value={newVlan.ipv4}
                      onChange={handleVlanInputChange}
                      placeholder="e.g., 192.168.1.1"
                    />
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup>
                    <Label>GW</Label>
                    <Input
                      type="text"
                      name="gateway"
                      value={newVlan.gateway}
                      onChange={handleVlanInputChange}
                      placeholder="e.g., 192.168.1.254"
                    />
                  </FormGroup>
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  <Button color="primary" size="sm" onClick={handleAddVlan}>
                    Add
                  </Button>
                </Col>
              </Row>

              {/* Table */}
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Type</th>
                    <th>DHCP/Static</th>
                    <th>IPv4</th>
                    <th>GW</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vlanSubinterfaces.length > 0 ? (
                    vlanSubinterfaces.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.tag}</td>
                        <td>{item.type}</td>
                        <td>{item.mode}</td>
                        <td>{item.ipv4}</td>
                        <td>{item.gateway}</td>
                        <td>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleDeleteVlan(idx)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No VLAN subinterfaces added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <Button color="danger" size="sm" onClick={handleDeleteAllVlans}>
                Delete All VLANs
              </Button>
            </Container>
          </Collapse>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="warning" onClick={() => console.log("Update", formData)}>
          Update
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InterfaceSettingsModal;
