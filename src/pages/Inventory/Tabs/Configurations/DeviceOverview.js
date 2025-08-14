import React, { useState } from "react";
import { Badge, Button } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import { FaCog } from "react-icons/fa";

const DeviceOverview = ({ device, setModalOpen, setSelectedInterface }) => {
  if (!device || !Array.isArray(device.interfaces)) return null;

  const interfaceData = device.interfaces.map((iface, index) => {
    const route = (device.staticroutes || []).find(
      (r) => r.ifname === iface.devId
    );
    return {
      id: iface._id || index,
      ...iface,
      metric: route?.metric || iface.metric || "-",
      IPv4Display: iface.IPv4 ? `${iface.IPv4}/${iface.IPv4Mask || 24}` : "-",
      assigned: iface.isAssigned ? "Yes" : "No",
    };
  });

  const columns = [
    {
      dataField: "settings",
      text: "",
      formatter: (_, row) => (
        <Button
          color="link"
          onClick={() => {
            setSelectedInterface(row);
            setModalOpen(true);
          }}
        >
          <FaCog />
        </Button>
      ),
      editable: false,
      headerStyle: { width: "50px" },
    },
    {
      dataField: "name",
      text: "Name",
      editable: false,
      formatter: (cell, row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              marginRight: 8,
              border: "2px solid #ccc",
              backgroundColor:
                row.linkStatus && row.linkStatus.toLowerCase() === "up"
                  ? "green"
                  : "transparent",
            }}
          ></span>

          {cell}
        </div>
      ),
    },
    {
      dataField: "type",
      text: "Type",
      editable: true,
    },
    {
      dataField: "assigned",
      text: "Assigned",
      editable: false,
      formatter: (cell) => (
        <Badge color={cell === "Yes" ? "success" : "danger"}>{cell}</Badge>
      ),
    },
    {
      dataField: "IPv4Display",
      text: "IPv4",
      editable: true,
    },
    {
      dataField: "gateway",
      text: "GW",
      editable: true,
    },
    {
      dataField: "metric",
      text: "Metric",
      editable: true,
    },
    {
      dataField: "PublicIP",
      text: "Public IP",
      editable: true,
    },
    {
      dataField: "routing",
      text: "Routing",
      editable: false,
    },
  ];

  return (
    <div className="table-responsive">
      <BootstrapTable
        keyField="id"
        data={interfaceData}
        columns={columns}
        cellEdit={cellEditFactory({ mode: "click" })}
      />
    </div>
  );
};

export default DeviceOverview;
