import React, { useEffect, useState } from "react";
import {
    Button,
    Spinner,
    Table,
    UncontrolledTooltip,
    Container,
} from "reactstrap";
import { getData, deleteData } from "../../helpers/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ✅ Toastify
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VRRPGroupTable = () => {
    document.title = "VRRP | Minia";
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getData(`/vrrp`);
            setGroups(res || []);
        } catch (err) {
            console.error("❌ Error fetching groups:", err);
            setError("Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await deleteData(`/vrrp/${id}?org=68764b74d712a564f6306593`);
            toast.success("Vrrp group deleted successfully!")
            setGroups((prev) => prev.filter((g) => g._id !== id));
        } catch (err) {
            console.error("❌ Error deleting group:", err);
            const apiMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to save group";

            toast.error(`❌ ${apiMessage}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <Container fluid>
                {/* New Group Button */}
                <div className="mb-3">
                    <Button
                        color="primary"
                        onClick={() => navigate("/create-edit-vrrp-table")}
                    >
                        New VRRP Group
                    </Button>
                </div>

                {error && <p className="text-danger">{error}</p>}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : groups.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Virtual Router ID</th>
                                    <th>Virtual IP</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group) => (
                                    <tr key={group._id}>
                                        <td>{group.name}</td>
                                        <td>{group.virtualRouterId}</td>
                                        <td>{group.virtualIp}</td>
                                        <td>
                                            {/* Edit */}
                                            <Button
                                                color="warning"
                                                size="sm"
                                                className="me-2"
                                                id={`edit-${group._id}`}
                                                onClick={() =>
                                                    navigate("/create-edit-vrrp-table", {
                                                        state: { group },
                                                    })
                                                }
                                            >
                                                <FaEdit />
                                            </Button>
                                            <UncontrolledTooltip target={`edit-${group._id}`}>
                                                Edit
                                            </UncontrolledTooltip>

                                            {/* Delete */}
                                            <Button
                                                color="danger"
                                                size="sm"
                                                id={`delete-${group._id}`}
                                                onClick={() => handleDelete(group._id)}
                                            >
                                                {deletingId === group._id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </Button>
                                            <UncontrolledTooltip target={`delete-${group._id}`}>
                                                Delete
                                            </UncontrolledTooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No VRRP Groups found.</p>
                )}
            </Container>
        </div>
    );
};

export default VRRPGroupTable;
