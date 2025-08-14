import React, { useState, useEffect } from "react";
import { Spinner } from "reactstrap";
import { getData } from "../../../../helpers/api";
import DeviceOverview from "./DeviceOverview"; // We'll extract DeviceOverview
import InterfaceSettingsModal from "./InterfaceSettingModal";

const DeviceInterfacePage = ({ _id }) => {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        setDeviceData(response[0]);
      } catch (err) {
        setError("Failed to load device data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [_id]);

  return (
    <div>
      {loading ? (
        <Spinner className="m-4" />
      ) : error ? (
        <p className="text-danger m-4">{error}</p>
      ) : (
        <>
          <DeviceOverview
            device={deviceData}
            setModalOpen={setModalOpen}
            setSelectedInterface={setSelectedInterface}
          />
          <InterfaceSettingsModal
            isOpen={modalOpen}
            toggle={() => setModalOpen(false)}
            iface={selectedInterface}
          />
        </>
      )}
    </div>
  );
};

export default DeviceInterfacePage;
