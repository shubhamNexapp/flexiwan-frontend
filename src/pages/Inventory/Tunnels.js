// ./Tunnels.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Badge,
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
import { getData, postData, putData } from "../../helpers/api"; // ✅ make sure postData is available
import { FaRegEdit, FaTrash } from "react-icons/fa";
import BootstrapTable from "react-bootstrap-table-next";

const Tunnels = () => {
  const [tunnels, setTunnels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTunnel, setSelectedTunnel] = useState(null);
  const [notificationsSettings, setNotificationsSettings] = useState({});

  document.title = "Tunnels | Minia";

  useEffect(() => {
    const fetchTunnels = async () => {
      try {
        const response = await getData(
          "/tunnels?filters=%5B%5D&limit=10&offset=0&sortField=num&sortOrder=asc"
        );
        setTunnels(response || []);
      } catch (error) {
        console.error("Error fetching tunnels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTunnels();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleEdit = (tunnel) => {
    setSelectedTunnel(tunnel);
    setNotificationsSettings(tunnel.notificationsSettings || {});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTunnel) return;

    // ✅ build payload dynamically
    const payload = {
      org: selectedTunnel.org?._id, // org from tunnel
      tunnelsIdList: [selectedTunnel._id],
      notifications: notificationsSettings,
    };

    try {
      const res = await putData(
        "https://manage.flexiwan.com/api/tunnels/notifications",
        payload
      );
      console.log("✅ Update Success:", res);

      // update state locally
      const updated = tunnels.map((t) =>
        t._id === selectedTunnel._id ? { ...t, notificationsSettings } : t
      );
      setTunnels(updated);

      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error updating notifications:", error);
    }
  };

  const handleChange = (key, field, value) => {
    setNotificationsSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // ✅ Table columns
  const columns = [
    {
      dataField: "_id",
      text: "ID",
      hidden: true,
      editable: false,
    },
    {
      dataField: "num",
      text: "#",
      sort: true,
    },
    {
      dataField: "deviceA",
      text: "Device A",
      formatter: (cell, row) => (
        <>
          <strong>{row?.deviceA?.name}</strong> <br />
          <small>{row.interfaceADetails?.IPv4 || "No IP"}</small>
        </>
      ),
    },
    {
      dataField: "interfaceADetails",
      text: "Interface A",
      formatter: (cell, row) => (
        <>
          <strong>{row?.interfaceADetails?.name}</strong>
          <br />
          IP :{" "}
          <small>
            {row.interfaceADetails?.IPv4 || "No IP"}:{" "}
            {row?.interfaceADetails.PublicPort}
          </small>
          <br />
          Public IP:{" "}
          <small>
            {row.interfaceADetails?.PublicIP || "No IP"}:{" "}
            {row?.interfaceADetails.PublicPort}
          </small>
        </>
      ),
    },
    {
      dataField: "deviceB",
      text: "Device B",
      formatter: (cell, row) => (
        <>
          <strong>{row.deviceB?.name}</strong> <br />
          <small>{row.interfaceBDetails?.IPv4 || "No IP"}</small>
        </>
      ),
    },
    {
      dataField: "interfaceBDetails",
      text: "Interface B",
      formatter: (cell, row) => (
        <>
          <strong>{row?.interfaceBDetails?.name}</strong>
          <br />
          IP :{" "}
          <small>
            {row.interfaceBDetails?.IPv4 || "No IP"}:{" "}
            {row?.interfaceBDetails.PublicPort}
          </small>
          <br />
          Public IP:{" "}
          <small>
            {row.interfaceBDetails?.PublicIP || "No IP"}:{" "}
            {row?.interfaceBDetails.PublicPort}
          </small>
        </>
      ),
    },
    {
      dataField: "encryptionMethod",
      text: "Encryption",
      sort: true,
    },
    {
      dataField: "advancedOptions",
      text: "Advanced Options",
      formatter: (cell, row) => (
        <>
          MTU : <small>{row.advancedOptions?.mtu || "auto"} </small>
          <br />
          MSS Clamp : <small>{row.advancedOptions?.mssClamp || "yes"} </small>
          <br />
          Routing : <small>{row.advancedOptions?.routing || ""} </small>
          <br />
          OSPF Cost : <small>{row.advancedOptions?.ospfCost || 0} </small>
          <br />
          OSPF Area : <small>{row.advancedOptions?.ospfArea || 0} </small>
          <br />
        </>
      ),
    },
    {
      dataField: "tunnelStatus",
      text: "Status",
      sort: true,
    },
    {
      dataField: "actions",
      text: "Actions",
      formatter: (cell, row) => (
        <div className="d-flex gap-2">
          <Button color="success" size="sm" onClick={() => handleEdit(row)}>
            <FaRegEdit />
          </Button>
          {/* <Button color="danger" size="sm" onClick={() => handleDelete(row)}>
            <FaTrash />
          </Button> */}
        </div>
      ),
    },
  ];

  const handleDelete = (device) => {
    console.log("Delete tunnel", device._id);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Tunnels" breadcrumbItem="Tunnels" />
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <BootstrapTable
                keyField="_id"
                data={tunnels}
                columns={columns}
                striped
                hover
                condensed
                bootstrap4
              />
            </div>
          )}

          {/* Edit Modal */}
          <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
            <ModalHeader toggle={toggleModal}>Edit Notifications</ModalHeader>
            <ModalBody>
              {notificationsSettings &&
                Object.keys(notificationsSettings).map((key) => (
                  <div key={key} className="mb-4 border-bottom pb-2">
                    <h6>{key}</h6>
                    <FormGroup>
                      <Label>Warning Threshold</Label>
                      <Input
                        type="number"
                        value={notificationsSettings[key].warningThreshold}
                        onChange={(e) =>
                          handleChange(
                            key,
                            "warningThreshold",
                            Number(e.target.value)
                          )
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Critical Threshold</Label>
                      <Input
                        type="number"
                        value={notificationsSettings[key].criticalThreshold}
                        onChange={(e) =>
                          handleChange(
                            key,
                            "criticalThreshold",
                            Number(e.target.value)
                          )
                        }
                      />
                    </FormGroup>
                  </div>
                ))}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleSave}>
                Save
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Tunnels;
