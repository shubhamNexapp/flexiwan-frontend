import React, { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Table,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData, postData, putData } from "../../helpers/api";
import {
  FaStepBackward,
  FaStepForward,
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaEye,
} from "react-icons/fa";

const AppIdentifications = () => {
  document.title = "App Identifications | Minia";

  // ---------------- State ----------------
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);

  const [customApps, setCustomApps] = useState([]);
  const [customUpdatedAt, setCustomUpdatedAt] = useState(null);


  const [selectedApp, setSelectedApp] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [formData, setFormData] = useState({}); // for editing

  const limit = 22; // per page
  const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);

  // ---------------- Fetch Data ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const offset = (page - 1) * limit;
      const res = await getData(
        `/appidentifications?offset=${offset}&limit=${limit}&org=68764b74d712a564f6306593`
      );

      const allApps = res.appIdentifications || [];
      const normalApps = allApps.filter(
        (app) => !app.name?.startsWith("custom:")
      );
      const customAppsData = allApps.filter((app) =>
        app.name?.startsWith("custom:")
      );

      setApps(normalApps);
      setCustomApps(customAppsData);
      setCustomUpdatedAt(res.meta?.customUpdatedAt || null);

      setTotalRecords(res.meta?.total || allApps.length || 0);

      setApps(res.appIdentifications || []);
      // ensure totalRecords is set correctly
      setTotalRecords(res.meta?.total || res.appIdentifications?.length || 0);
    } catch (err) {
      console.error("❌ Error fetching app identifications:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // ---------------- Pagination ----------------
  const goToFirst = () => setPage(1);
  const goToLast = () => setPage(totalPages);
  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  // ---------------- View Modal ----------------
  const openViewModal = (app) => {
    setSelectedApp(app);
    setViewModal(true);
  };
  const closeViewModal = () => {
    setSelectedApp(null);
    setViewModal(false);
  };

  // ---- State ----
  const initialFormState = {
    name: "",
    description: "",
    category: "",
    serviceClass: "",
    importance: "",
    rules: [],
  };

  const [addModal, setAddModal] = useState(false);
  const [formDataAdd, setFormDataAdd] = useState(initialFormState);

  // ---- Handlers ----
  const openAddModal = () => {
    setFormDataAdd(initialFormState); // always reset to empty
    setAddModal(true);
  };

  const closeAddModal = () => {
    setFormDataAdd(initialFormState);
    setAddModal(false);
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setFormDataAdd((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---- Rules Handlers ----

  const addRule = () => {
    setFormDataAdd((prev) => ({
      ...prev,
      rules: [...prev.rules, { ip: "", port: "", protocol: "TCP" }],
    }));
  };

  const deleteRule = (index) => {
    setFormDataAdd((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleRuleChange = (index, field, value) => {
    setFormDataAdd((prev) => {
      const newRules = [...prev.rules];
      newRules[index][field] = value;
      return { ...prev, rules: newRules };
    });
  };

  // ---- Validation for Rules ----
  const validateRules = (rules) => {
    for (let i = 0; i < rules.length; i++) {
      const { ip, port, protocol } = rules[i];
      const filled = [ip, port, protocol].filter((val) => val && val !== "");

      // must have at least 1 value
      if (filled.length === 0) {
        return `Rule ${i + 1}: Please enter at least one field.`;
      }

      // only IP
      if (ip && !port && !protocol) continue;

      // only Port
      if (!ip && port && !protocol) continue;

      // any combination of 2 or 3 values is fine
      if (filled.length >= 2) continue;

      // invalid case
      return `Rule ${i + 1}: Please choose valid combination. The rule can be either only IP/Mask, only port, or any other combination of two or three values.`;
    }
    return ""; // no error
  };

  const handleAddSave = async () => {
    console.log("Saving add app:====", formDataAdd);

    // ✅ validate rules
    const validationError = validateRules(formDataAdd.rules);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: formDataAdd.name,
        description: formDataAdd.description,
        category: formDataAdd.category,
        serviceClass: formDataAdd.serviceClass,
        importance: formDataAdd.importance,
        rules: formDataAdd.rules.map((r) => ({
          ip: r.ip || undefined,
          ports: r.port || undefined,
          protocol: r.protocol || undefined,
        })),
      };

      const res = await postData(
        `/appidentifications?org=68764b74d712a564f6306593`,
        payload
      );

      console.log("res=======", res);
      fetchData();
      closeAddModal();
    } catch (err) {
      console.error("❌ Error saving app identification:", err);
      setError("Failed to save app identification");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Edit Modal ----------------
  const openEditModal = (app) => {
    setSelectedApp(app);
    setFormData({ ...app }); // ✅ load values into form
    setEditModal(true);
  };
  const closeEditModal = () => {
    setSelectedApp(null);
    setFormData({});
    setEditModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log("Saving updated app:====", formData);
    try {
      setLoading(true);
      setError("");

      const payload = {
        name: formData.name,
        category: formData.category,
        serviceClass: formData.serviceClass,
        importance: formData.importance,
      };

      const res = await putData(
        `/appidentifications/imported/${formData.id}?org=68764b74d712a564f6306593`,
        payload
      );
      fetchData();
      closeEditModal();
    } catch (err) {
      console.error("❌ Error fetching app identifications:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Traffic & App Identification"
            breadcrumbItem="App Identifications"
          />

          {/* 📌 Button to open modal */}
          <div className="mb-3">
            <Button color="primary" onClick={openAddModal}>
              New App Identification
            </Button>
          </div>

          {error && <p className="text-danger">{error}</p>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : apps.length > 0 ? (
            <>
              {/* Table */}
              <div className="table-responsive">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Service Class</th>
                      <th>Importance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app, index) => (
                      <tr key={app.id || index}>
                        <td>{app.id}</td>
                        <td>{app.name}</td>
                        <td>{app.description}</td>
                        <td>{app.category}</td>
                        <td>{app.serviceClass}</td>
                        <td>{app.importance}</td>
                        <td>
                          {/* Edit Button */}
                          <Button
                            color="warning"
                            size="sm"
                            className="me-2"
                            id={`edit-${app.id}`}
                            onClick={() => openEditModal(app)}
                          >
                            <FaEdit />
                          </Button>
                          <UncontrolledTooltip target={`edit-${app.id}`}>
                            Edit
                          </UncontrolledTooltip>

                          {/* View Button */}
                          <Button
                            color="info"
                            size="sm"
                            id={`more-${app.id}`}
                            onClick={() => openViewModal(app)}
                          >
                            <FaEye />
                          </Button>
                          <UncontrolledTooltip target={`more-${app.id}`}>
                            View Details
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <Button
                    color="secondary"
                    onClick={goToFirst}
                    disabled={page === 1}
                    className="me-2"
                    id="btnFirst"
                  >
                    <FaStepBackward />
                  </Button>
                  <UncontrolledTooltip target="btnFirst">
                    First page
                  </UncontrolledTooltip>

                  <Button
                    color="secondary"
                    onClick={prevPage}
                    disabled={page === 1}
                    className="me-2"
                    id="btnPrev"
                  >
                    <FaArrowLeft />
                  </Button>
                  <UncontrolledTooltip target="btnPrev">
                    Previous page
                  </UncontrolledTooltip>

                  <Button
                    color="secondary"
                    onClick={nextPage}
                    disabled={page === totalPages}
                    className="me-2"
                    id="btnNext"
                  >
                    <FaArrowRight />
                  </Button>
                  <UncontrolledTooltip target="btnNext">
                    Next page
                  </UncontrolledTooltip>

                  <Button
                    color="secondary"
                    onClick={goToLast}
                    disabled={page === totalPages}
                    id="btnLast"
                  >
                    <FaStepForward />
                  </Button>
                  <UncontrolledTooltip target="btnLast">
                    Last page
                  </UncontrolledTooltip>
                </div>
                <div>
                  Page {page} of {totalPages}
                </div>
              </div>
            </>
          ) : (
            <p>No App Identifications found.</p>
          )}
        </Container>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={viewModal} toggle={closeViewModal} size="md">
        <ModalHeader toggle={closeViewModal}>App Details</ModalHeader>
        <ModalBody>
          {selectedApp ? (
            <>
              <h6>Rules:</h6>
              {selectedApp.rules && selectedApp.rules.length > 0 ? (
                <ul>
                  {selectedApp.rules.map((rule) => (
                    <li key={rule._id}>
                      <strong>{rule.protocol?.toUpperCase() || "N/A"}</strong> |
                      Ports: {rule.ports || "N/A"} | IP: {rule.ip || "N/A"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No rules available.</p>
              )}
            </>
          ) : (
            <p>No app selected.</p>
          )}
        </ModalBody>
      </Modal>

      {/* ----Add Modal ---- */}
      <Modal isOpen={addModal} toggle={closeAddModal} size="lg">
        <ModalHeader toggle={closeAddModal}>Add App</ModalHeader>
        <ModalBody>
          <Form>
            {/* Name */}
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formDataAdd.name}
                onChange={handleChangeAdd}
              />
            </FormGroup>

            {/* Description */}
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="text"
                id="description"
                name="description"
                value={formDataAdd.description}
                onChange={handleChangeAdd}
              />
            </FormGroup>

            {/* Category */}
            <FormGroup>
              <Label for="category">Category</Label>
              <Input
                type="select"
                id="category"
                name="category"
                value={formDataAdd.category}
                onChange={handleChangeAdd}
              >
                <option value="">-- Select Category --</option>
                <option value="management">Management</option>
                <option value="email">Email</option>
                <option value="network">Network</option>
                <option value="internet">Internet</option>
                <option value="backup">Backup</option>
              </Input>
            </FormGroup>

            {/* Service Class */}
            <FormGroup>
              <Label for="serviceClass">Service Class</Label>
              <Input
                type="select"
                id="serviceClass"
                name="serviceClass"
                value={formDataAdd.serviceClass}
                onChange={handleChangeAdd}
              >
                <option value="">-- Select Service Class --</option>
                <option value="oam">OAM</option>
                <option value="default">Default</option>
                <option value="signaling">Signaling</option>
              </Input>
            </FormGroup>

            {/* Importance */}
            <FormGroup>
              <Label for="importance">Importance</Label>
              <Input
                type="select"
                id="importance"
                name="importance"
                value={formDataAdd.importance}
                onChange={handleChangeAdd}
              >
                <option value="">-- Select Importance --</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Input>
            </FormGroup>
          </Form>

          {/* ---- App Identification Rules ---- */}
          <hr />
          <h5>App Identification Rules</h5>
          <Button color="success" size="sm" onClick={addRule}>
            + Add Rule
          </Button>
          <Table bordered hover size="sm" className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>Protocol</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {formDataAdd.rules.map((rule, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <Input
                      type="text"
                      placeholder="e.g. 192.168.1.1"
                      value={rule.ip}
                      onChange={(e) =>
                        handleRuleChange(index, "ip", e.target.value)
                      }
                      pattern="\b\d{1,3}(\.\d{1,3}){3}\b"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      placeholder="e.g. 8080"
                      value={rule.port}
                      onChange={(e) =>
                        handleRuleChange(index, "port", e.target.value)
                      }
                      min="1"
                      max="65535"
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={rule.protocol}
                      onChange={(e) =>
                        handleRuleChange(index, "protocol", e.target.value)
                      }
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                    </Input>
                  </td>
                  <td>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => deleteRule(index)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {formDataAdd.rules.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No rules added
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeAddModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleAddSave}>
            Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={closeEditModal} size="md">
        <ModalHeader toggle={closeEditModal}>Edit App</ModalHeader>
        <ModalBody>
          {formData && (
            <Form>
              {/* Name */}
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              {/* Description */}
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              {/* Category Dropdown */}
              <FormGroup>
                <Label for="category">Category</Label>
                <Input
                  type="select"
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Select Category --</option>
                  <option value="management">Management</option>
                  <option value="email">Email</option>
                  <option value="network">Network</option>
                  <option value="internet">Internet</option>
                  <option value="backup">Backup</option>
                </Input>
              </FormGroup>

              {/* Service Class Dropdown */}
              <FormGroup>
                <Label for="serviceClass">Service Class</Label>
                <Input
                  type="select"
                  id="serviceClass"
                  name="serviceClass"
                  value={formData.serviceClass || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Select Service Class --</option>
                  <option value="oam">OAM</option>
                  <option value="default">Default</option>
                  <option value="signaling">Signaling</option>
                </Input>
              </FormGroup>

              {/* Importance Dropdown */}
              <FormGroup>
                <Label for="importance">Importance</Label>
                <Input
                  type="select"
                  id="importance"
                  name="importance"
                  value={formData.importance || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Select Importance --</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Input>
              </FormGroup>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default AppIdentifications;
