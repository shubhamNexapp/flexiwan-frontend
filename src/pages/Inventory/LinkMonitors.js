// ./LinkMonitors.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData, postData, putData, deleteData } from "../../helpers/api";
import { FaRegEdit, FaTrash, FaPlus } from "react-icons/fa";
import BootstrapTable from "react-bootstrap-table-next";

const LinkMonitors = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "icmp",
    icmp: { servers: [""], timeout: 1000, attempts: 3, threshold: 2 },
    http: { urls: [""], timeout: 1000, attempts: 3, threshold: 2 },
  });

  document.title = "Link Monitors | Minia";

  // -------- Fetch Data --------
  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        setLoading(true);
        const response = await getData(
          "/linkMonitors?org=68764b74d712a564f6306593"
        );
        setMonitors(response || []);
      } catch (error) {
        console.error("❌ Error fetching Link Monitors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitors();
  }, []);

  // -------- Modal Helpers --------
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const resetForm = () => {
    setSelectedMonitor(null);
    setFormData({
      name: "",
      type: "icmp",
      icmp: { servers: [""], timeout: 1000, attempts: 3, threshold: 2 },
      http: { urls: [""], timeout: 1000, attempts: 3, threshold: 2 },
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (monitor) => {
    setSelectedMonitor(monitor);
    setFormData({
      name: monitor.name || "",
      type: monitor.type || "icmp",
      icmp: monitor.icmp || {
        servers: [""],
        timeout: 1000,
        attempts: 3,
        threshold: 2,
      },
      http: monitor.http || {
        urls: [""],
        timeout: 1000,
        attempts: 3,
        threshold: 2,
      },
    });
    setIsModalOpen(true);
  };

  // -------- Save (Add/Edit) --------
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        type: formData.type,
        icmp: formData.type === "icmp" ? formData.icmp : null,
        http: formData.type === "http" ? formData.http : null,
      };

      if (selectedMonitor) {
        // update
        const res = await putData(
          `/linkMonitors/${selectedMonitor._id}?org=68764b74d712a564f6306593`,
          payload
        );
        console.log("✅ Updated:", res);

        setMonitors((prev) =>
          prev.map((m) =>
            m._id === selectedMonitor._id ? { ...m, ...payload } : m
          )
        );
      } else {
        // create
        const res = await postData(
          `/linkMonitors?org=68764b74d712a564f6306593`,
          payload
        );
        console.log("✅ Created:", res);
        setMonitors((prev) => [...prev, res]);
      }

      toggleModal();
      resetForm();
    } catch (error) {
      console.error("❌ Error saving Link Monitor:", error);
    } finally {
      setSaving(false);
    }
  };

  // -------- Delete --------
  const handleDelete = async (monitor) => {
    if (monitor.isDefault) {
      alert("❌ Default monitors cannot be deleted!");
      return;
    }

    try {
      setDeletingId(monitor._id);
      await deleteData(
        `/linkMonitors/${monitor._id}?org=68764b74d712a564f6306593`
      );
      setMonitors((prev) => prev.filter((m) => m._id !== monitor._id));
    } catch (error) {
      console.error("❌ Error deleting monitor:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // -------- Input Change Handlers --------
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleArrayChange = (section, index, value, fieldName) => {
    const updated = [...formData[section][fieldName]];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [fieldName]: updated },
    }));
  };

  const addArrayItem = (section, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [fieldName]: [...prev[section][fieldName], ""],
      },
    }));
  };

  const removeArrayItem = (section, fieldName, index) => {
    const updated = [...formData[section][fieldName]];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [fieldName]: updated },
    }));
  };

  // -------- Table Columns --------
  const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    { dataField: "name", text: "Name", sort: true },
    { dataField: "type", text: "Type", sort: true },
    {
      dataField: "actions",
      text: "Actions",
      formatter: (cell, row) => (
        <div className="d-flex gap-2">
          <Button color="success" size="sm" onClick={() => handleEdit(row)}>
            <FaRegEdit />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row._id || row.isDefault}
          >
            {deletingId === row._id ? <Spinner size="sm" /> : <FaTrash />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Link Monitors" breadcrumbItem="Link Monitors" />

          {/* Add button */}
          <div className="mb-3 text-end">
            <Button color="primary" onClick={handleAdd}>
              <FaPlus className="me-1" /> Add Link Monitor
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <BootstrapTable
                keyField="_id"
                data={monitors}
                columns={columns}
                striped
                hover
                condensed
                bootstrap4
              />
            </div>
          )}

          {/* Modal for Add/Edit */}
          <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
            <ModalHeader toggle={toggleModal}>
              {selectedMonitor ? "Edit Link Monitor" : "Add Link Monitor"}
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Type</Label>
                <Input
                  type="select"
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="icmp">ICMP</option>
                  <option value="http">HTTP</option>
                </Input>
              </FormGroup>

              {/* ICMP Config */}
              {formData.type === "icmp" && (
                <>
                  <FormGroup>
                    <Label>Servers</Label>
                    {formData.icmp.servers.map((srv, idx) => (
                      <div key={idx} className="d-flex mb-2">
                        <Input
                          type="text"
                          value={srv}
                          onChange={(e) =>
                            handleArrayChange(
                              "icmp",
                              idx,
                              e.target.value,
                              "servers"
                            )
                          }
                        />
                        <Button
                          color="danger"
                          size="sm"
                          className="ms-2"
                          onClick={() =>
                            removeArrayItem("icmp", "servers", idx)
                          }
                          disabled={formData.icmp.servers.length === 1}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => addArrayItem("icmp", "servers")}
                    >
                      + Add Server
                    </Button>
                  </FormGroup>
                  <FormGroup>
                    <Label>Timeout</Label>
                    <Input
                      type="number"
                      value={formData.icmp.timeout}
                      onChange={(e) =>
                        handleNestedChange("icmp", "timeout", e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Attempts</Label>
                    <Input
                      type="number"
                      value={formData.icmp.attempts}
                      onChange={(e) =>
                        handleNestedChange("icmp", "attempts", e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Threshold</Label>
                    <Input
                      type="number"
                      value={formData.icmp.threshold}
                      onChange={(e) =>
                        handleNestedChange("icmp", "threshold", e.target.value)
                      }
                    />
                  </FormGroup>
                </>
              )}

              {/* HTTP Config */}
              {formData.type === "http" && (
                <>
                  <FormGroup>
                    <Label>URLs</Label>
                    {formData.http.urls.map((url, idx) => (
                      <div key={idx} className="d-flex mb-2">
                        <Input
                          type="text"
                          value={url}
                          onChange={(e) =>
                            handleArrayChange(
                              "http",
                              idx,
                              e.target.value,
                              "urls"
                            )
                          }
                        />
                        <Button
                          color="danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => removeArrayItem("http", "urls", idx)}
                          disabled={formData.http.urls.length === 1}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => addArrayItem("http", "urls")}
                    >
                      + Add URL
                    </Button>
                  </FormGroup>
                  <FormGroup>
                    <Label>Timeout</Label>
                    <Input
                      type="number"
                      value={formData.http.timeout}
                      onChange={(e) =>
                        handleNestedChange("http", "timeout", e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Attempts</Label>
                    <Input
                      type="number"
                      value={formData.http.attempts}
                      onChange={(e) =>
                        handleNestedChange("http", "attempts", e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Threshold</Label>
                    <Input
                      type="number"
                      value={formData.http.threshold}
                      onChange={(e) =>
                        handleNestedChange("http", "threshold", e.target.value)
                      }
                    />
                  </FormGroup>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => {
                  toggleModal();
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button color="primary" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" /> : "Save"}
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default LinkMonitors;
