// ./NetworkTraffic.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Label, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData } from "../../helpers/api";
import Chart from "react-apexcharts";
import dayjs from "dayjs";

const NetworkTraffic = () => {
    document.title = "NetworkTraffic | Minia";

    const [devices, setDevices] = useState([]);
    const [chartData, setChartData] = useState({ series: [], options: {} });
    const [selectedDevice, setSelectedDevice] = useState("All");
    const [selectedDirection, setSelectedDirection] = useState("RX+TX");

    // Fetch devices from API
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
        if (!devices || devices.length === 0) return;

        // Filter by device
        let filtered = [...devices];
        if (selectedDevice !== "All") {
            filtered = filtered.filter((d) => d.name === selectedDevice);
        }

        // Sort by time ascending
        const sorted = [...filtered].sort((a, b) => a.time - b.time);

        // X-axis categories (15-min intervals)
        const times = sorted.map((d) => {
            const minute = dayjs.unix(d.time).minute();
            return minute % 15 === 0
                ? dayjs.unix(d.time).format("HH:mm")
                : dayjs.unix(d.time).format("HH:mm");
        });

        // Prepare RX, TX, RX+TX values
        const rxPPS = sorted.map((d) => d.rx_pps || 0);
        const txPPS = sorted.map((d) => d.tx_pps || 0);
        const rxTXPPS = sorted.map((d) => (d.rx_pps || 0) + (d.tx_pps || 0));

        const rxBPS = sorted.map((d) => (d.rx_bps || 0) / 1000); // KB/s
        const txBPS = sorted.map((d) => (d.tx_bps || 0) / 1000);
        const rxTXBPS = sorted.map(
            (d) => ((d.rx_bps || 0) + (d.tx_bps || 0)) / 1000
        );

        // Pick data based on selectedDirection
        let ppsData = [];
        let bpsData = [];
        let seriesNamePPS = "";
        let seriesNameBPS = "";

        if (selectedDirection === "RX") {
            ppsData = rxPPS;
            bpsData = rxBPS;
            seriesNamePPS = "RX PPS";
            seriesNameBPS = "RX BPS";
        } else if (selectedDirection === "TX") {
            ppsData = txPPS;
            bpsData = txBPS;
            seriesNamePPS = "TX PPS";
            seriesNameBPS = "TX BPS";
        } else {
            ppsData = rxTXPPS;
            bpsData = rxTXBPS;
            seriesNamePPS = "RX+TX PPS";
            seriesNameBPS = "RX+TX BPS";
        }

        // Chart config
        setChartData({
            series: [
                { name: seriesNamePPS, type: "line", data: ppsData },
                { name: seriesNameBPS, type: "line", data: bpsData },
            ],
            options: {
                chart: {
                    height: 350,
                    type: "line",
                    toolbar: {
                        tools: {
                            download: true,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false,
                        },
                    },
                },
                stroke: { curve: "smooth", width: 2 },
                colors: ["#FFA500", "#008FFB"],
                dataLabels: { enabled: false },
                xaxis: {
                    categories: times,
                    labels: { rotate: -45 },
                    title: { text: "Time" },
                },
                yaxis: [
                    {
                        title: { text: "PPS (Packets/sec)" },
                        labels: { formatter: (val) => val.toFixed(0) },
                    },
                    {
                        opposite: true,
                        title: { text: "BPS (kB/sec)" },
                        labels: { formatter: (val) => `${val.toFixed(1)}k` },
                    },
                ],
                tooltip: { shared: true, intersect: false },
                legend: { position: "top" },
            },
        });
    }, [devices, selectedDevice, selectedDirection]);

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Network Traffic" breadcrumbItem="Network Traffic" />
                <h3>Statistics - PPS vs BPS</h3>

                {/* Filters */}
                {/* <Row className="mb-3">
                    <Col md={4}>
                        <Label for="deviceFilter">Device Name</Label>
                        <Input
                            type="select"
                            id="deviceFilter"
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                        >
                            <option value="All">All</option>
                            {devices.map((d) => (
                                <option key={d._id || d.name} value={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </Input>
                    </Col>
                    <Col md={4}>
                        <Label for="directionFilter">Direction</Label>
                        <Input
                            type="select"
                            id="directionFilter"
                            value={selectedDirection}
                            onChange={(e) => setSelectedDirection(e.target.value)}
                        >
                            <option value="RX">RX</option>
                            <option value="TX">TX</option>
                            <option value="RX+TX">RX+TX</option>
                        </Input>
                    </Col>
                </Row> */}

                {/* Chart */}
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="line"
                    height={400}
                />
            </Container>
        </div>
    );
};

export default NetworkTraffic;
