import React, { useEffect, useState } from "react";
import {
    Spinner,
    Table,
    Container,
} from "reactstrap";
import { getData, deleteData } from "../../helpers/api";
import { useNavigate } from "react-router-dom";

const PathSelection = () => {
    document.title = "VRRP | Minia";

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getData(`/vrrp/status`);
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

    return (
        <div >
            <Container fluid>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : apps.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>VRRP Group Name</th>
                                    <th>Virtual Router ID</th>
                                    <th>Virtual IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map((app, index) => (
                                    <tr key={app._id || index}>
                                        <td>{app.name}</td>
                                        <td>{app.virtualRouterId}</td>
                                        <td>{app.virtualIp}</td>
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
