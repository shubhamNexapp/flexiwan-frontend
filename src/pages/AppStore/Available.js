// ./Installed.js
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
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Installed = () => {
    document.title = "Installed | Minia";
    const navigate = useNavigate();

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getData(
                `/appstore/purchased?org=68764b74d712a564f6306593`
            );
            setApps(res || []);
        } catch (err) {
            console.error("❌ Error fetching apps:", err);
            toast.error("Failed to load installed applications");
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
            await deleteData(`/appstore/purchased/${id}?org=68764b74d712a564f6306593`);
            toast.success("Application deleted successfully!");
            setApps((prev) => prev.filter((app) => app._id !== id));
        } catch (err) {
            console.error("❌ Error deleting app:", err);
            const apiMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to delete app";

            toast.error(`❌ ${apiMessage}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs
                    title="Applications"
                    breadcrumbItem="Applications"
                />
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : apps.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Application</th>
                                    <th>Description</th>
                                    <th>Installed Version</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map((app) => (
                                    <tr key={app._id}>
                                        <td>{app.appStoreApp?.name}</td>
                                        <td>{app.appStoreApp?.description}</td>
                                        <td>{app.installedVersion}</td>
                                        <td>
                                            {/* Edit */}
                                            <button
                                                className="btn btn-outline-success waves-effect waves-light"
                                                id={`edit-${app._id}`}
                                                onClick={() =>
                                                    navigate("/edit-configurations", { state: { from: "/available", app } })
                                                }
                                            >
                                                Open
                                            </button>
                                            <UncontrolledTooltip target={`edit-${app._id}`}>
                                                Open
                                            </UncontrolledTooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <p>No Installed Applications found.</p>
                )}
            </Container>
        </div>
    );
};

export default Installed;
