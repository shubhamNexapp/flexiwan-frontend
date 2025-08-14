import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import { FaCopy, FaDownload, FaRedo } from "react-icons/fa";
import { getData } from "../../../../helpers/api"; // Adjust path

const RecoveryInfo = ({ _id }) => {
  document.title = "Devices | Minia";

  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchRecoveryInfo = async () => {
    setLoading(true);
    try {
      const res = await getData(`devices/${_id}/recoveryInfo`);
      setRecoveryData(res);
    } catch (err) {
      console.error("Error fetching recovery info", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoveryInfo();
  }, []);

  const handleCopy = () => {
    if (recoveryData) {
      const text = JSON.stringify(recoveryData, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const handleDownload = () => {
    if (recoveryData) {
      const blob = new Blob(
        [JSON.stringify(recoveryData, null, 2)],
        { type: "text/plain;charset=utf-8" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fwagent_info.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle className="h4 mb-0">Recovery Instructions</CardTitle>
          <Button
            color="secondary"
            size="sm"
            onClick={fetchRecoveryInfo}
            id="btnRefresh"
          >
            <FaRedo />
          </Button>
          <UncontrolledTooltip target="btnRefresh">
            Refresh recovery information
          </UncontrolledTooltip>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" />
            </div>
          ) : recoveryData ? (
            <ol>
              <li className="mb-3">
                <strong>Save the following device information:</strong>
                <pre
                  className="p-2 bg-light border rounded"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {JSON.stringify(recoveryData, null, 2)}
                </pre>
                <div className="d-flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={handleCopy}
                    id="btnCopy"
                  >
                    <FaCopy />
                  </Button>
                  <UncontrolledTooltip target="btnCopy">
                    {copySuccess ? "Copied!" : "Copy to clipboard"}
                  </UncontrolledTooltip>

                  <Button
                    color="success"
                    size="sm"
                    onClick={handleDownload}
                    id="btnDownload"
                  >
                    <FaDownload />
                  </Button>
                  <UncontrolledTooltip target="btnDownload">
                    Download as fwagent_info.txt
                  </UncontrolledTooltip>
                </div>
              </li>

              <li className="mb-3">
                Save it on the device in:
                <pre className="p-2 bg-light border rounded">
                  /etc/flexiwan/agent/fwagent_info.txt
                </pre>
              </li>

              <li className="mb-3">
                Restart the device control service:
                <pre className="p-2 bg-light border rounded">
                  sudo systemctl restart flexiwan-router
                </pre>
              </li>

              <li className="mb-3">
                Wait until the configuration is synced to your device.
              </li>
            </ol>
          ) : (
            <p className="text-muted">No recovery data found.</p>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default RecoveryInfo;
