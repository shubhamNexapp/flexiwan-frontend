import React, { useState } from "react";
import {
  Button,
  Input,
  FormGroup,
  Label,
  Alert,
  Spinner,
  Table,
  UncontrolledTooltip,
} from "reactstrap";
import { getData } from "../../../../helpers/api"; // Adjust import path
import {
  FaTable,
  FaAlignLeft,
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaStepBackward,
  FaStepForward,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const Logs = ({ _id }) => {
  document.title = "Devices | Minia";

  const [limit, setLimit] = useState(100);
  const [filter, setFilter] = useState("fwagent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("recentLast"); // recentFirst or recentLast
  const logsPerPage = 10;

  const filterMap = {
    fwagent: "fwagent",
    agentui: "agentui",
    syslog: "syslog",
    dhcp: "dhcp",
    vpp: "vpp",
    routing: "ospf",
    hostapd: "hostapd",
    application_ids: "application_ids",
  };

  const fetchLogs = async () => {
    if (limit > 10000) {
      setError("Number of lines cannot exceed 10000");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const apiFilter = filterMap[filter] || filter;
      const response = await getData(
        `devices/${_id}/logs?filter=${apiFilter}&limit=${limit}`
      );

      if (response && Array.isArray(response.logs)) {
        setLogs(response.logs);
        setCurrentPage(1);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLog = (log) => {
    const jsonMatch = log.match(/{.*}/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0].replace(/#012/g, "\n"));
        const pretty = JSON.stringify(parsed, null, 2);
        return (
          <>
            {log.substring(0, log.indexOf("{"))}
            <pre style={{ background: "#f8f9fa", padding: "5px" }}>
              {pretty}
            </pre>
          </>
        );
      } catch {
        return log.replace(/#012/g, "\n");
      }
    }
    return log.replace(/#012/g, "\n");
  };

  // Sort logs based on sortOrder
  const sortedLogs = sortOrder === "recentFirst" ? [...logs].reverse() : logs;

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const nextPage = () =>
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  const downloadLogs = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs_${filter}_${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <React.Fragment>
      {/* Controls */}
      <div className="d-flex justify-content-between mb-3">
        {/* Left side - Filters */}
        <div className="d-flex">
          <FormGroup className="m me-3">
            <Label for="limit">Lines</Label>
            <Input
              type="number"
              id="limit"
              value={limit}
              min="1"
              max="10000"
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </FormGroup>

          <FormGroup className="me-3">
            <Label for="filter">Filter</Label>
            <Input
              type="select"
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="fwagent">flexiEdge Agent</option>
              <option value="agentui">flexiEdge UI</option>
              <option value="syslog">syslog</option>
              <option value="dhcp">DHCP Server</option>
              <option value="vpp">VPP</option>
              <option value="routing">Routing</option>
              <option value="hostapd">Hostapd</option>
              <option value="application_ids">App Identifications</option>
            </Input>
          </FormGroup>

          <div className="align-self-end mb-3 me-2">
            <Button color="primary" onClick={fetchLogs} id="btnFetch">
              Fetch
            </Button>
            <UncontrolledTooltip target="btnFetch">
              Fetch logs
            </UncontrolledTooltip>
          </div>

          <div className="align-self-end mb-3 me-2">
            <Button
              color={viewMode === "table" ? "secondary" : "outline-secondary"}
              onClick={() => setViewMode("table")}
              id="btnTableView"
            >
              <FaTable />
            </Button>
            <UncontrolledTooltip target="btnTableView">
              Table view
            </UncontrolledTooltip>
          </div>
          <div className="align-self-end mb-3 me-2">
            <Button
              color={viewMode === "raw" ? "secondary" : "outline-secondary"}
              onClick={() => setViewMode("raw")}
              id="btnRawView"
            >
              <FaAlignLeft />
            </Button>
            <UncontrolledTooltip target="btnRawView">
              Raw view
            </UncontrolledTooltip>
          </div>
          <div className="align-self-end mb-3 me-2">
            <Button
              color="outline-secondary"
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "recentFirst" ? "recentLast" : "recentFirst"
                )
              }
              id="btnSortOrder"
            >
              {sortOrder === "recentFirst" ? <FaArrowDown /> : <FaArrowUp />}
            </Button>
            <UncontrolledTooltip target="btnSortOrder">
              {sortOrder === "recentFirst" ? "Recent First" : "Recent Last"}
            </UncontrolledTooltip>
          </div>
        </div>

        {/* Right side - Download */}
        <div className="align-self-end">
          <Button color="success" onClick={downloadLogs} id="btnDownload">
            <FaDownload />
          </Button>
          <UncontrolledTooltip target="btnDownload">
            Download all logs
          </UncontrolledTooltip>
        </div>
      </div>

      {/* Error */}
      {error && <Alert color="danger">{error}</Alert>}

      {/* Loading */}
      {loading ? (
        <Spinner className="m-4" />
      ) : logs.length > 0 ? (
        <>
          {viewMode === "table" ? (
            <>
              <div className="table-responsive">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log, index) => (
                      <tr key={indexOfFirstLog + index}>
                        <td>{indexOfFirstLog + index + 1}</td>
                        <td style={{ whiteSpace: "pre-wrap" }}>
                          {formatLog(log)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <Button
                    color="secondary"
                    onClick={goToFirst}
                    disabled={currentPage === 1}
                    className="me-2"
                    id="btnFirst"
                  >
                    <FaStepBackward />
                  </Button>
                  <UncontrolledTooltip target="btnFirst">
                    First page
                  </UncontrolledTooltip>

                  <Button
                    color="secondary"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="me-2"
                    id="btnPrev"
                  >
                    <FaArrowLeft />
                  </Button>
                  <UncontrolledTooltip target="btnPrev">
                    Previous page
                  </UncontrolledTooltip>

                  <Button
                    color="secondary"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="me-2"
                    id="btnNext"
                  >
                    <FaArrowRight />
                  </Button>
                  <UncontrolledTooltip target="btnNext">
                    Next page
                  </UncontrolledTooltip>

                  <Button
                    color="secondary"
                    onClick={goToLast}
                    disabled={currentPage === totalPages}
                    id="btnLast"
                  >
                    <FaStepForward />
                  </Button>
                  <UncontrolledTooltip target="btnLast">
                    Last page
                  </UncontrolledTooltip>
                </div>
                <div>
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </>
          ) : (
            <pre style={{ background: "#f8f9fa", padding: "10px" }}>
              {sortedLogs.join("\n")}
            </pre>
          )}
        </>
      ) : (
        <p></p>
      )}
    </React.Fragment>
  );
};

export default Logs;
