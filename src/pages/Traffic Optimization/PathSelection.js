import React, { useEffect, useState } from "react";
import {
    Button,
    Spinner,
    Table,
    UncontrolledTooltip,
    Container,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData, deleteData } from "../../helpers/api";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PathSelection = () => {
    document.title = "Path Selection | Minia";
    const navigate = useNavigate();

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null); // 👈 track which row is deleting


    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getData(`/mlpolicies/meta`);
            setApps(res || []);
        } catch (err) {
            console.error("❌ Error fetching policies:", err);
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🔹 Handle Delete
    const handleDelete = async (id) => {
        try {
            setDeletingId(id); // show spinner on this row
            await deleteData(`/mlpolicies/${id}/?org=68764b74d712a564f6306593`);
            setApps((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            console.error("❌ Error deleting policy:", err);
            alert("Failed to delete policy");
        } finally {
            setDeletingId(null); // reset
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs
                    title="Path Selection Policies"
                    breadcrumbItem="Path Selection Policies"
                />

                {/* 📌 Button to navigate to create page */}
                <div className="mb-3">
                    <Button color="primary" onClick={() => navigate("/create-policy")}>
                        New Policy
                    </Button>
                </div>

                {error && <p className="text-danger">{error}</p>}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : apps.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Installed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map((app, index) => (
                                    <tr key={app._id || index}>
                                        <td>{app.name}</td>
                                        <td>{app.description}</td>
                                        <td>{app.installCount?.installed ?? "-"}</td>
                                        <td>
                                            {/* 🔹 Edit */}
                                            <Button
                                                color="warning"
                                                size="sm"
                                                className="me-2"
                                                id={`edit-${app._id}`}
                                                onClick={() =>
                                                    navigate(`/create-policy`, { state: { policy: app } })
                                                }
                                            >
                                                <FaEdit />
                                            </Button>
                                            <UncontrolledTooltip target={`edit-${app._id}`}>
                                                Edit
                                            </UncontrolledTooltip>
                                            {/* 🔹 Delete */}
                                            <Button
                                                color="danger"
                                                size="sm"
                                                id={`delete-${app._id}`}
                                                onClick={() => handleDelete(app._id)}
                                            >
                                                {deletingId === app._id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </Button>
                                            <UncontrolledTooltip target={`delete-${app._id}`}>
                                                Delete
                                            </UncontrolledTooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No Policies found.</p>
                )}
            </Container>
        </div>
    );
};

export default PathSelection;
