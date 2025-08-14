import React from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";

const DiskChart = ({ responseData }) => {
  const sorted = [...responseData].sort((a, b) => a.time - b.time);

  const times = sorted.map((d) => {
    const minute = dayjs.unix(d.time).minute();
    // Only show time if divisible by 15, else return empty string for spacing
    return minute % 15 === 0 ? dayjs.unix(d.time).format("HH:mm") : "";
  });
  const diskUsage = sorted.map((d) => d.disk);

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
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: times,
      title: { text: "Time" },
      labels: { rotate: -45 },
    },
    yaxis: {
      min: 0,
      max: 24,
      tickAmount: 12,
      title: { text: "Disk [%]" },
      labels: { formatter: (val) => val },
    },
    tooltip: {
      x: { format: "HH:mm" },
      y: { formatter: (val) => `${val.toFixed(2)}%` },
    },
    markers: { size: 4 },
    grid: {
      borderColor: "#e0e0e0",
      row: { colors: ["#f9f9f9", "transparent"], opacity: 0.5 },
    },
  };

  const series = [{ name: "Disk Usage", data: diskUsage }];

  return (
    <div>
      <h3>Disk</h3>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default DiskChart;
