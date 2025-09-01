// ./QOS.js
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
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Firewall = () => {
    document.title = "Firewall Policies | Minia";
    const navigate = useNavigate();

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null); // 👈 track which row is deleting
    const [error, setError] = useState("");

    // Fetch list
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getData(`/firewallpolicies/meta`);
            setPolicies(res || []);
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

    // Delete
    const handleDelete = async (id) => {
        try {
            setDeletingId(id); // show spinner on this row
            await deleteData(`/qosPolicies/${id}?org=68764b74d712a564f6306593`);
            setPolicies((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            console.error("❌ Error deleting policy:", err);
        } finally {
            setDeletingId(null); // reset
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Firewall Policies" breadcrumbItem="Firewall Policies" />

                {/* Add Button */}
                <div className="mb-3">
                    <Button color="primary" onClick={() => navigate("/create-edit-firewall")}>
                        New Firewall Policy
                    </Button>
                </div>

                {error && <p className="text-danger">{error}</p>}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : policies.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.map((policy) => (
                                    <tr key={policy._id}>
                                        <td>{policy.name}</td>
                                        <td>{policy.description}</td>
                                        <td>{policy.installCount.installed}</td>
                                        <td>
                                            {/* Edit */}
                                            <Button
                                                color="warning"
                                                size="sm"
                                                className="me-2"
                                                id={`edit-${policy._id}`}
                                                onClick={() =>
                                                    navigate("/create-edit-firewall", { state: { policy } })
                                                }
                                            >
                                                <FaEdit />
                                            </Button>
                                            <UncontrolledTooltip target={`edit-${policy._id}`}>
                                                Edit
                                            </UncontrolledTooltip>

                                            {/* Delete */}
                                            <Button
                                                color="danger"
                                                size="sm"
                                                id={`delete-${policy._id}`}
                                                onClick={() => handleDelete(policy._id)}
                                                disabled={deletingId === policy._id} // disable while deleting
                                            >
                                                {deletingId === policy._id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </Button>
                                            <UncontrolledTooltip target={`delete-${policy._id}`}>
                                                Delete
                                            </UncontrolledTooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No QOS Firewall found.</p>
                )}
            </Container>
        </div>
    );
};

export default Firewall;
