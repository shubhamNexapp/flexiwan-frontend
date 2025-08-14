import React from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";

const AllCPU = ({ responseData }) => {
  document.title = "Devices | Minia";

  // Sort by time ascending
  const sorted = [...responseData].sort((a, b) => a.time - b.time);

  // X-axis times (only show if divisible by 15 mins)
  const times = sorted.map((d) => {
    const minute = dayjs.unix(d.time).minute();
    return minute % 15 === 0 ? dayjs.unix(d.time).format("HH:mm") : "";
  });

  // Separate CPU arrays into series
  const cpu0 = sorted.map((d) => d.cpu[0]);
  const cpu1 = sorted.map((d) => d.cpu[1]);
  const cpu2 = sorted.map((d) => d.cpu[2]);
  const cpu3 = sorted.map((d) => d.cpu[3]);

  const options = {
    chart: {
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
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: times,
      title: { text: "Time" },
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 10,
      title: { text: "CPU [%]" },
      labels: {
        formatter: (val) => val,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: { format: "HH:mm" },
      y: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    },
    markers: {
      size: 4,
    },
    grid: {
      borderColor: "#e0e0e0",
      row: { colors: ["#f9f9f9", "transparent"], opacity: 0.5 },
    },
    legend: {
      position: "top",
    },
  };

  const series = [
    { name: "CPU 0", data: cpu0 },
    { name: "CPU 1", data: cpu1 },
    { name: "CPU 2", data: cpu2 },
    { name: "CPU 3", data: cpu3 },
  ];

  return (
    <div>
      <h3>All CPU Cores</h3>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default AllCPU;
