import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Collapse,
  Card,
  CardBody,
  Row,
  Col,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { getData, postData, putData } from "../../helpers/api";

const CreatePolicy = () => {
  document.title = "Create / Edit Policy | Minia";
  const navigate = useNavigate();
  const location = useLocation();

  // If editing, get policy passed from PathSelection
  const existingPolicy = location.state?.policy || null;

  // 🔹 API-driven path labels
  const [pathLabels, setPathLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Main form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Tunnel",
    overrideDefaultRoute: false,
    applyOnWANInbound: false,
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  // 🔹 Rule Table State
  const [rule, setRule] = useState({
    name: "Default",
    category: "N/A",
    classificationBy: "prefix",
    status: "disabled",
    pathLabel: "",
    priority: "priority",
  });

  // 🔹 Modal State
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(rule);

  // Prefill if editing
  useEffect(() => {
    if (existingPolicy) {
      setFormData({
        name: existingPolicy.name,
        description: existingPolicy.description,
        type: existingPolicy.type || "Tunnel",
        overrideDefaultRoute: existingPolicy.overrideDefaultRoute ?? false,
        applyOnWANInbound: existingPolicy.applyOnWan ?? false,
      });
      // if existingPolicy.rules exists → prefill first rule
      if (existingPolicy.rules && existingPolicy.rules.length > 0) {
        setRule({
          name: existingPolicy.rules[0].name,
          category: "N/A",
          classificationBy: "prefix",
          status: existingPolicy.rules[0].enabled ? "enabled" : "disabled",
          pathLabel: existingPolicy.rules[0].action.links[0].pathlabels[0]._id,
          priority: existingPolicy.rules[0].priority || "priority",
        });
      }
    }
  }, [existingPolicy]);

  // Fetch path labels
  useEffect(() => {
    const fetchPathLabels = async () => {
      try {
        setLoading(true);
        const response = await getData("/pathlabels");
        setPathLabels(response || []);
      } catch (error) {
        console.error("Error fetching path labels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPathLabels();
  }, []);

  // Handle input change (form + switches)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit main form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      applyOnWan: formData.applyOnWANInbound,
      overrideDefaultRoute: formData.overrideDefaultRoute,
      rules: [
        {
          name: rule.name,
          priority: 0,
          enabled: rule.status === "enabled",
          action: {
            links: [
              {
                id: 0,
                pathlabels: [
                  pathLabels.find((pl) => pl._id === rule.pathLabel) || {},
                ],
                order: "priority",
              },
            ],
            order: "priority",
            fallback: "by-destination",
          },
          classification: {
            prefix: {
              ip: "0.0.0.0/0",
              ports: "",
              protocol: "",
            },
          },
        },
      ],
    };

    try {
      if (existingPolicy?._id) {
        await putData(`/mlpolicies/${existingPolicy._id}?org=68764b74d712a564f6306593`, payload);
      } else {
        await postData("/mlpolicies?org=68764b74d712a564f6306593", payload);
      }
      navigate("/path-selection");
    } catch (error) {
      console.error("❌ Error saving policy:", error);
    }
  };

  // Modal handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setRule(editData);
    setEditModal(false);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Path Selection"
          breadcrumbItem={existingPolicy ? "Edit Policy" : "Create Policy"}
        />

        <Card>
          <CardBody>
            {/* 🔹 Top bar with Back and Save buttons */}
            <Row className="mb-4 align-items-center">
              <Col xs="6">
                <Button
                  color="link"
                  onClick={() => navigate("/path-selection")}
                  className="p-0 d-flex align-items-center"
                >
                  <FaArrowLeft className="me-2" /> Back
                </Button>
              </Col>
              <Col xs="6" className="text-end">
                <Button color="primary" onClick={handleSubmit}>
                  {existingPolicy ? "Update Policy" : "Save Policy"}
                </Button>
              </Col>
            </Row>

            <Form onSubmit={handleSubmit}>
              {/* Name */}
              <FormGroup>
                <Label for="name">Policy Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              {/* Description */}
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormGroup>

              {/* Advanced Options */}
              <Button
                color="secondary"
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="mb-3"
              >
                {advancedOpen
                  ? "Hide Advanced Options"
                  : "Show Advanced Options"}
              </Button>

              <Collapse isOpen={advancedOpen}>
                <Card className="mb-3">
                  <CardBody>
                    <FormGroup switch>
                      <Input
                        type="switch"
                        id="overrideDefaultRoute"
                        name="overrideDefaultRoute"
                        checked={formData.overrideDefaultRoute}
                        onChange={handleChange}
                      />
                      <Label for="overrideDefaultRoute" check>
                        Override Default Route
                      </Label>
                    </FormGroup>

                    <FormGroup switch>
                      <Input
                        type="switch"
                        id="applyOnWANInbound"
                        name="applyOnWANInbound"
                        checked={formData.applyOnWANInbound}
                        onChange={handleChange}
                      />
                      <Label for="applyOnWANInbound" check>
                        Apply on WAN Inbound
                      </Label>
                    </FormGroup>
                  </CardBody>
                </Card>
              </Collapse>
            </Form>
          </CardBody>
        </Card>

        {/* 🔹 Rule Table */}
        <Card className="mt-4">
          <CardBody>
            <h5>Rule Table</h5>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Classification By</th>
                  <th>Status</th>
                  <th>Path Label</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{rule.name}</td>
                  <td>{rule.category}</td>
                  <td>{rule.classificationBy}</td>
                  <td>{rule.status}</td>
                  <td>
                    {
                      pathLabels.find((pl) => pl._id === rule.pathLabel)
                        ?.name || "-"
                    }
                  </td>
                  <td>{rule.priority}</td>
                  <td>
                    <Button
                      color="warning"
                      size="sm"
                      onClick={() => {
                        setEditData(rule);
                        setEditModal(true);
                      }}
                    >
                      <FaEdit /> Edit
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </CardBody>
        </Card>

        {/* 🔹 Edit Modal */}
        <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)}>
          <ModalHeader toggle={() => setEditModal(!editModal)}>
            Update Rule
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="editName">Name</Label>
                <Input
                  type="text"
                  id="editName"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="editCategory">Category</Label>
                <Input
                  type="text"
                  id="editCategory"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="editClassificationBy">Classification By</Label>
                <Input
                  type="select"
                  id="editClassificationBy"
                  name="classificationBy"
                  value={editData.classificationBy}
                  onChange={handleEditChange}
                >
                  <option value="prefix">Prefix</option>
                  <option value="application">Application</option>
                  <option value="port">Port</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="editStatus">Status</Label>
                <Input
                  type="select"
                  id="editStatus"
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="editPathLabel">Path Label</Label>
                <Input
                  type="select"
                  id="editPathLabel"
                  name="pathLabel"
                  value={editData.pathLabel || ""}
                  onChange={handleEditChange}
                >
                  <option value="">-- Select Path Label --</option>
                  {pathLabels.map((label) => (
                    <option key={label._id} value={label._id}>
                      {label.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSaveEdit}>
              Save
            </Button>
            <Button color="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default CreatePolicy;
