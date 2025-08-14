import React, { useState } from "react";
import { Button, Spinner } from "reactstrap";
import ReactJson from "react-json-view";
import { getData } from "../../../../helpers/api"; // Adjust path if needed

const EdgeSettings = ({ _id }) => {
  document.title = "Devices | Minia";

  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await getData(`devices/${_id}/configuration`);
      setConfigData(response || {});
    } catch (err) {
      console.error("Error fetching settings:", err);
      setConfigData({ error: "Failed to fetch settings" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Button
        color="primary"
        onClick={fetchSettings}
        disabled={loading}
        className="mb-3"
      >
        {loading ? <Spinner size="sm" /> : "Fetch Settings"}
      </Button>

      {configData && (
        <div
          style={{
            background: "#1e1e1e",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <ReactJson
            src={configData}
            theme="monokai"
            collapsed={false}
            displayDataTypes={false}
            enableClipboard={true}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default EdgeSettings;
