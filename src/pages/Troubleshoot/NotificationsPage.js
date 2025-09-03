// ./Jobs.js
import React, { useEffect, useState } from "react";
import {
    Button,
    Spinner,
    Table,
    Container,
    Badge,
    UncontrolledTooltip,
} from "reactstrap";
import { getData, putData } from "../../helpers/api"; // 👈 make sure you have putData helper
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FaQuestionCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const NotificationsPage = () => {
    document.title = "Notifications | Minia";

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getData(
                `/notifications/?filters=%5B%5D&limit=10&offset=0&sortField=lastResolvedStatusChange&sortOrder=desc`
            );
            setJobs(res || []);
        } catch (err) {
            console.error("❌ Error fetching jobs:", err);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusBadge = (job) => {
        if (job.resolved) {
            return <Badge color="success">Resolved</Badge>;
        }
        return <Badge color="info">{job.status || "Active"}</Badge>;
    };

    const filteredJobs =
        filter === "all"
            ? jobs
            : jobs.filter((job) => {
                if (filter === "resolved") return job.resolved === true;
                if (filter === "active") return job.resolved === false;
                if (filter === "info") return job.isInfo === true;
                return true;
            });

    // 👁 Toggle read/unread API
    const toggleReadStatus = async (job) => {
        const newStatus = job.status === "read" ? "unread" : "read";

        try {
            await putData(`/notifications/${job._id}`, {
                status: newStatus,
                resolve: null,
            });

            toast.success(`Marked as ${newStatus}`);
            setJobs((prev) =>
                prev.map((j) =>
                    j._id === job._id ? { ...j, status: newStatus } : j
                )
            );
        } catch (err) {
            console.error("❌ Error updating status:", err);
            toast.error("Failed to update notification status");
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Notifications" breadcrumbItem="Notifications" />

                {/* Filter Buttons */}
                <div className="mb-3 d-flex gap-2 flex-wrap">
                    {["all", "active", "resolved", "info"].map((status) => (
                        <Button
                            key={status}
                            color={filter === status ? "primary" : "outline-primary"}
                            size="sm"
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
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
                                    <th>Time</th>
                                    <th>Notification</th>
                                    <th>Severity</th>
                                    <th>Status</th>
                                    <th>Targets</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job) => (
                                    <tr key={job._id}>
                                        {/* Time */}
                                        <td>{moment(job.time).format("MMM DD, YYYY, hh:mm A")}</td>

                                        {/* Notification + tooltip */}
                                        <td>
                                            {job.title || "-"}{" "}
                                            <FaQuestionCircle
                                                id={`tooltip-${job._id}`}
                                                style={{
                                                    color: "#0d6efd",
                                                    marginLeft: "5px",
                                                    cursor: "pointer",
                                                }}
                                            />
                                            <UncontrolledTooltip
                                                placement="top"
                                                target={`tooltip-${job._id}`}
                                            >
                                                {job.details || "No details"}
                                            </UncontrolledTooltip>

                                            {/* Count badge */}
                                            <span
                                                id={`count-${job._id}`}
                                                style={{
                                                    display: "inline-block",
                                                    backgroundColor: "#0d6efd",
                                                    color: "#fff",
                                                    borderRadius: "50%",
                                                    width: "18px",
                                                    height: "18px",
                                                    lineHeight: "18px",
                                                    textAlign: "center",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    marginLeft: "10px",
                                                }}
                                            >
                                                {job.count || 0}
                                            </span>
                                            <UncontrolledTooltip
                                                placement="top"
                                                target={`count-${job._id}`}
                                            >
                                                {`The event occurs ${job.count || 0} ${(job.count || 0) > 1 ? "times" : "time"
                                                    }`}
                                            </UncontrolledTooltip>
                                        </td>

                                        {/* Severity */}
                                        <td>{job.severity || "-"}</td>

                                        {/* Status */}
                                        <td>{getStatusBadge(job)}</td>

                                        {/* Targets capsules */}
                                        <td>
                                            {job.targets?.deviceId && (
                                                <span
                                                    style={{
                                                        backgroundColor: "#d4edda",
                                                        color: "#155724",
                                                        padding: "4px 10px",
                                                        borderRadius: "15px",
                                                        marginRight: "5px",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    Device: {job.targets.deviceId.name}
                                                </span>
                                            )}
                                            {job.targets?.interfaceId && (
                                                <span
                                                    style={{
                                                        backgroundColor: "#f8d7da",
                                                        color: "#721c24",
                                                        padding: "4px 10px",
                                                        borderRadius: "15px",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    Interface: {job.targets.interfaceId.name}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <Button
                                                id={`toggle-${job._id}`}
                                                color="link"
                                                size="sm"
                                                onClick={() => toggleReadStatus(job)}
                                            >
                                                {job.status === "read" ? (
                                                    <FaEye style={{ color: "#0d6efd" }} />
                                                ) : (
                                                    <FaEyeSlash style={{ color: "#6c757d" }} />
                                                )}
                                            </Button>
                                            <UncontrolledTooltip
                                                placement="top"
                                                target={`toggle-${job._id}`}
                                            >
                                                {job.status === "read"
                                                    ? "Mark as Unread"
                                                    : "Mark as Read"}
                                            </UncontrolledTooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No Notifications found.</p>
                )}
            </Container>
        </div>
    );
};

export default NotificationsPage;
