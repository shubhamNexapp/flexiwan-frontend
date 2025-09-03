// ./Network.js
import React, { useEffect, useRef, useState } from "react";
import { Container } from "reactstrap";
import { DataSet } from "vis-data";
import { Network } from "vis-network";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData } from "../../helpers/api";

const NetworkGraph = () => {
    document.title = "Network | Minia";

    const [devices, setDevices] = useState([]);
    const containerRef = useRef(null);
    const networkRef = useRef(null);

    // Fetch devices
    const fetchDevices = async () => {
        try {
            const response = await getData("/devices?response=summary");
            setDevices(response || []);
        } catch (error) {
            console.error("❌ Failed to fetch devices:", error);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        if (!devices.length || !containerRef.current) return;

        // Create nodes
        const nodes = new DataSet(
            devices.map((device, index) => ({
                id: device._id || index + 1,
                label: device.name,
                title: `Device: ${device.name}`, // Tooltip
            }))
        );

        // Define edges based on specific names
        const edgesList = [];
        const getIdByName = (name) => devices.find((d) => d.name === name)?._id;

        const hubId = getIdByName("Hub-IRX-400");
        const spoke1Id = getIdByName("Spoke-IRX-400-GE");
        const spoke2Id = getIdByName("Spoke-IRX400-GE-1");

        // 🔹 Spoke-IRX-400-GE ↔ Hub-IRX-400 (two-way)
        if (hubId && spoke1Id) {
            edgesList.push({ from: hubId, to: spoke1Id });
            edgesList.push({ from: spoke1Id, to: hubId });
        }

        // 🔹 Spoke-IRX400-GE-1 → Hub-IRX-400 (one-way only)
        if (hubId && spoke2Id) {
            edgesList.push({ from: spoke2Id, to: hubId });
        }

        // IRX-400-12 → stays isolated (no edge)

        const edges = new DataSet(edgesList);

        // Data & options
        const data = { nodes, edges };
        const options = {
            autoResize: true,
            nodes: {
                shape: "dot",
                size: 20,
                font: { size: 14, color: "#343a40" },
                borderWidth: 2,
            },
            edges: {
                color: "#848484",
                width: 2,
                smooth: true,
                arrows: { to: { enabled: true, scaleFactor: 0.7 } }, // directional arrows
            },
            interaction: {
                hover: true,
                navigationButtons: true,
                keyboard: true,
            },
            physics: {
                enabled: true,
                stabilization: { iterations: 200 },
            },
        };

        // Destroy old network before creating a new one
        if (networkRef.current) {
            networkRef.current.destroy();
        }

        networkRef.current = new Network(containerRef.current, data, options);
    }, [devices]);

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Network" breadcrumbItem="Network" />

                <div
                    ref={containerRef}
                    style={{
                        height: "500px",
                        border: "1px solid lightgray",
                        borderRadius: "8px",
                    }}
                />
            </Container>
        </div>
    );
};

export default NetworkGraph;
