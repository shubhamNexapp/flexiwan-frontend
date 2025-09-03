// ./Jobs.js
import React, { useEffect, useState } from "react";
import {
    Button,
    Spinner,
    Table,
    Container,
    Badge,
    Collapse,
    Card,
    CardBody
} from "reactstrap";
import { getData } from "../../helpers/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ReactJson from "react-json-view";

const Jobs = () => {
    document.title = "Jobs | Minia";

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [openRow, setOpenRow] = useState(null); // ✅ track open row

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getData(
                `/jobs?status=all&offset=0&limit=50&org=68764b74d712a564f6306593`
            );
            setJobs(res || []);
        } catch (err) {
            console.error("❌ Error fetching jobs:", err);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusBadge = (state) => {
        switch (state?.toLowerCase()) {
            case "completed":
            case "complete":
                return <Badge color="success">Completed</Badge>;
            case "failed":
                return <Badge color="danger">Failed</Badge>;
            case "waiting":
                return <Badge color="warning">Waiting</Badge>;
            case "running":
                return <Badge color="info">Running</Badge>;
            case "retry":
                return <Badge color="secondary">Retry</Badge>;
            default:
                return <Badge color="dark">{state}</Badge>;
        }
    };

    const filteredJobs =
        filter === "all"
            ? jobs
            : jobs.filter((job) => job.state?.toLowerCase() === filter.toLowerCase());

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Jobs" breadcrumbItem="Jobs" />

                {/* Filter Buttons */}
                <div className="mb-3 d-flex gap-2 flex-wrap">
                    {["all", "complete", "failed", "waiting", "retry", "running"].map(
                        (status) => (
                            <Button
                                key={status}
                                color={filter === status ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        )
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Title</th>
                                    <th>Device Name</th>
                                    <th>Created</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job) => (
                                    <React.Fragment key={job._id}>
                                        <tr
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                                setOpenRow(openRow === job._id ? null : job._id)
                                            }
                                        >
                                            <td>{job._id}</td>
                                            <td>{job.data?.title || "-"}</td>
                                            <td>{job.device?.name || "-"}</td>
                                            <td>
                                                {moment((job.created_at)).format(
                                                    "MMM DD, YYYY, hh:mm A"
                                                )}
                                            </td>
                                            <td>{getStatusBadge(job.state)}</td>
                                        </tr>

                                        {/* Expanded row */}
                                        {openRow === job._id && (
                                            <tr>
                                                <td colSpan="5">
                                                    <Collapse isOpen={true}>
                                                        <Card>
                                                            <CardBody>
                                                                <p>
                                                                    <strong>User:</strong>{" "}
                                                                    {job.data?.metadata?.username ||
                                                                        "N/A"}
                                                                </p>
                                                                <p>
                                                                    <strong>Organization:</strong>{" "}
                                                                    {job.data?.metadata?.org || "N/A"}
                                                                </p>
                                                                <p>
                                                                    <strong>Attempts:</strong>{" "}
                                                                    {job.attempts?.made} of{" "}
                                                                    {job.attempts?.max}
                                                                </p>

                                                                <h6>Tasks JSON</h6>
                                                                <pre
                                                                    style={{
                                                                        background: "#f8f9fa",
                                                                        padding: "10px",
                                                                        borderRadius: "5px",
                                                                        maxHeight: "400px",
                                                                        overflow: "auto",
                                                                    }}
                                                                >
                                                                    <ReactJson
                                                                        src={job.data?.message?.tasks}
                                                                        theme="monokai"
                                                                        collapsed={false}
                                                                        displayDataTypes={false}
                                                                        enableClipboard={true}
                                                                    />
                                                                </pre>
                                                            </CardBody>
                                                        </Card>
                                                    </Collapse>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No Jobs found.</p>
                )}
            </Container>
        </div>
    );
};

export default Jobs;
