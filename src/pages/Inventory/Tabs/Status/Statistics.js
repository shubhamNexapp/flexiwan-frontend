import React, { useEffect, useState } from "react";
import MemoryChart from "./Charts/MemoryChart";
import PPSBPSChart from "./Charts/PPSBPSChart";
import DiskChart from "./Charts/DiskChart";
import TemperatureChart from "./Charts/TemperatureChart";
import { getData } from "../../../../helpers/api";
import AllCPU from "./Charts/AllCPU";
import { Table, Button, Spinner, Badge } from "reactstrap";

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in ms

const Statistics = ({ _id, OrgID }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(true);
  const [StatisticsDeviceDetails, setStatisticsDeviceDetails] = useState([]);
  const [HealthDeviceDetails, setHealthDeviceDetails] = useState([]);

  const fetchStatisticsData = async () => {
    try {
      const response = await getData(`devices/${_id}/statistics?org=${OrgID}`);
      setStatisticsDeviceDetails(response);
    } catch (err) {
      console.error("Error loading statistics data", err);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await getData(`devices/${_id}/health?org=${OrgID}`);
      setHealthDeviceDetails(response);
    } catch (err) {
      console.error("Error loading health data", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatisticsData(), fetchHealthData()]);
      setLoading(false);
    };

    // Initial load
    loadData();

    // Auto-refresh every 15 minutes
    const intervalId = setInterval(loadData, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [_id]);

  return (
    <div>
      {loading ? (
        <p>
          <Spinner />
        </p>
      ) : (
        <>
          <PPSBPSChart responseData={StatisticsDeviceDetails} />
          <AllCPU responseData={HealthDeviceDetails} />
          <MemoryChart responseData={HealthDeviceDetails} />
          <DiskChart responseData={HealthDeviceDetails} />
          <TemperatureChart responseData={HealthDeviceDetails} />
        </>
      )}
    </div>
  );
};

export default Statistics;
