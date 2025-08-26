// ./PathLabels.js
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
  FormText,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData, postData, putData, deleteData } from "../../helpers/api";
import { FaRegEdit, FaTrash, FaPlus } from "react-icons/fa";
import BootstrapTable from "react-bootstrap-table-next";

const PathLabels = () => {
  const [pathLabels, setPathLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // ✅ loader for delete

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Tunnel", // default type
    description: "",
    color: "#000000",
  });

  document.title = "Path Labels | Minia";

  // Fetch data
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

  // Toggle modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Reset form
  const resetForm = () => {
    setSelectedLabel(null);
    setFormData({
      name: "",
      type: "Tunnel",
      description: "",
      color: "#000000",
    });
  };

  // Handle add new
  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (label) => {
    setSelectedLabel(label);
    setFormData({
      name: label.name || "",
      type: label.type || "Tunnel",
      description: label.description || "",
      color: label.color || "#000000",
    });
    setIsModalOpen(true);
  };

  // Save handler (both add + edit)
  const handleSave = async () => {
    try {
      setSaving(true);

      const data = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        type: formData.type,
      };

      if (selectedLabel) {
        // update
        const res = await putData(
          `/pathlabels/${selectedLabel._id}/?org=68764b74d712a564f6306593`,
          data
        );
        console.log("✅ Updated:", res);

        setPathLabels((prev) =>
          prev.map((p) => (p._id === selectedLabel._id ? { ...p, ...data } : p))
        );
      } else {
        // create
        const res = await postData(
          `/pathlabels?org=68764b74d712a564f6306593`,
          data
        );
        console.log("✅ Created:", res);
        setPathLabels((prev) => [...prev, res]);
      }

      toggleModal();
      resetForm();
    } catch (error) {
      console.error("❌ Error saving path label:", error);
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (label) => {
    try {
      setDeletingId(label._id);
      await deleteData(
        `/pathlabels/${label._id}/?org=68764b74d712a564f6306593`
      );
      setPathLabels((prev) => prev.filter((p) => p._id !== label._id));
    } catch (error) {
      console.error("❌ Error deleting path label:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Change input
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle toggle change
  const handleToggleChange = () => {
    setFormData((prev) => ({
      ...prev,
      type: prev.type === "Tunnel" ? "DIA" : "Tunnel",
    }));
  };

  // Table columns
  const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    {
      dataField: "name",
      text: "Name",
      sort: true,
      formatter: (cell, row) => (
        <span
          style={{
            backgroundColor: row.color || "#ccc",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "6px",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          {row.name}
        </span>
      ),
    },
    { dataField: "type", text: "Type", sort: true },
    { dataField: "description", text: "Description" },
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
            disabled={deletingId === row._id}
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
          <Breadcrumbs title="Path Labels" breadcrumbItem="Path Labels" />

          {/* Add button */}
          <div className="mb-3 text-end">
            <Button color="primary" onClick={handleAdd}>
              <FaPlus className="me-1" /> Add Path Label
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
                data={pathLabels}
                columns={columns}
                striped
                hover
                condensed
                bootstrap4
              />
            </div>
          )}

          {/* Modal for Add/Edit */}
          <Modal isOpen={isModalOpen} toggle={toggleModal} size="md">
            <ModalHeader toggle={toggleModal}>
              {selectedLabel ? "Edit Path Label" : "Add Path Label"}
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

              {/* Toggle for type */}
              <FormGroup>
                <Label>Type</Label>
                <div className="form-check form-switch">
                  <Input
                    type="switch"
                    id="typeToggle"
                    checked={formData.type === "DIA"}
                    onChange={handleToggleChange}
                  />
                  <FormText>
                    {formData.type === "DIA"
                      ? "Direct Internet Access (DIA)"
                      : "Tunnel"}
                  </FormText>
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                />
              </FormGroup>
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

export default PathLabels;
