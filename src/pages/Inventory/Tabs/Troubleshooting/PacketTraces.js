import React, { useState } from "react";
import {
  Button,
  Input,
  FormGroup,
  Label,
  UncontrolledTooltip,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Progress,
} from "reactstrap";
import { getData } from "../../../../helpers/api"; // Adjust path as needed
import { FaPlay } from "react-icons/fa";

const PacketTraces = ({ _id }) => {
  document.title = "Devices | Minia";

  const [packets, setPackets] = useState(10);
  const [timeout, setTimeoutVal] = useState(5);
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [traces, setTraces] = useState([]);
  const [error, setError] = useState("");

  const simulateProgress = () => {
    setProgressValue(0);
    let value = 0;
    const interval = setInterval(() => {
      value += 10;
      setProgressValue(value);
      if (value >= 100) clearInterval(interval);
    }, 200);
  };

  const fetchTraces = async () => {
    if (packets <= 0) {
      setError("Packets must be greater than 0");
      return;
    }
    if (timeout <= 0) {
      setError("Timeout must be greater than 0");
      return;
    }
    setError("");
    setLoading(true);
    simulateProgress();
    try {
      const response = await getData(
        `devices/${_id}/traces?packets=${packets}&timeout=${timeout}`
      );
      if (response && Array.isArray(response)) {
        setTraces(response);
      } else if (response?.traces) {
        setTraces(response.traces);
      } else {
        setTraces([]);
      }
    } catch (err) {
      console.error("Error fetching packet traces", err);
      setTraces([]);
    } finally {
      setLoading(false);
      setProgressValue(100);
    }
  };

  return (
    <React.Fragment>
      {/* Input Controls */}
      <div className="d-flex align-items-end mb-3">
        <FormGroup className="me-3">
          <Label for="packets">Packets</Label>
          <Input
            type="number"
            id="packets"
            value={packets}
            min="1"
            onChange={(e) => setPackets(Number(e.target.value))}
          />
          <UncontrolledTooltip target="packets">
            Number of packets to capture (e.g., 10)
          </UncontrolledTooltip>
        </FormGroup>

        <FormGroup className="me-3">
          <Label for="timeout">Timeout (sec)</Label>
          <Input
            type="number"
            id="timeout"
            value={timeout}
            min="1"
            onChange={(e) => setTimeoutVal(Number(e.target.value))}
          />
          <UncontrolledTooltip target="timeout">
            Time to wait before stopping capture (in seconds)
          </UncontrolledTooltip>
        </FormGroup>

        <div className="mb-3 me-3">
          <Button color="primary" onClick={fetchTraces} id="btnFetch">
            <FaPlay />
          </Button>
          <UncontrolledTooltip target="btnFetch">
            Start packet trace
          </UncontrolledTooltip>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="text-danger mb-2">{error}</div>}

      {/* Progress Bar when loading */}
      {loading && (
        <Card className="mb-3">
          <CardHeader>
            <CardTitle className="h5">Fetching Packet Traces...</CardTitle>
          </CardHeader>
          <CardBody>
            <Progress
              value={progressValue}
              color="primary"
              style={{ width: "100%" }}
              animated
            />
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {traces.length > 0 && !loading ? (
        <pre style={{ background: "#f8f9fa", padding: "10px" }}>
          {traces.join("\n")}
        </pre>
      ) : (
        !loading && <p>No traces found</p>
      )}
    </React.Fragment>
  );
};

export default PacketTraces;
