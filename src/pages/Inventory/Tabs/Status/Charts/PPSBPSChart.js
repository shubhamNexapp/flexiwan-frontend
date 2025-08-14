import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";

const PPSBPSChart = ({ responseData }) => {
  document.title = "Devices | Minia";

  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    if (!responseData || responseData.length === 0) return;

    // Sort by time
    const sorted = [...responseData].sort((a, b) => a.time - b.time);

    // X-axis times at 15-min intervals
    const times = sorted.map((d) => {
      const minute = dayjs.unix(d.time).minute();
      return minute % 15 === 0 ? dayjs.unix(d.time).format("HH:mm") : "";
    });

    // Calculate totals
    const totalPPS = sorted.map((d) => (d.rx_pps || 0) + (d.tx_pps || 0));
    const totalBPSk = sorted.map(
      (d) => ((d.rx_bps || 0) + (d.tx_bps || 0)) / 1000 // Convert to kB/sec
    );

    // Chart config
    setChartData({
      series: [
        {
          name: "PPS (RX + TX)",
          type: "line",
          data: totalPPS,
        },
        {
          name: "BPS (RX + TX)",
          type: "line",
          data: totalBPSk,
        },
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
            min: 0,
            max: 8,
            tickAmount: 8, // difference of 1
            labels: { formatter: (val) => val.toFixed(0) },
          },
          {
            opposite: true,
            title: { text: "BPS (kB/sec)" },
            min: 0,
            max: 7,
            tickAmount: 14, // difference of 0.5
            labels: { formatter: (val) => `${val.toFixed(1)}k` },
          },
        ],
        tooltip: { shared: true, intersect: false },
        legend: { position: "top" },
      },
    });
  }, [responseData]);

  return (
    <div>
      <h3>Statistics - PPS vs BPS</h3>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={400}
      />
    </div>
  );
};

export default PPSBPSChart;
