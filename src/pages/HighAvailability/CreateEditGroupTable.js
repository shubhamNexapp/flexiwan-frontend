import React, { useEffect, useState } from "react";
import {
    Button,
    Container,
    Form,
    FormGroup,
    Label,
    Input,
    Spinner,
    Card,
    Row,
    Col,
    CardBody,
} from "reactstrap";
import { postData, putData } from "../../helpers/api";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// ✅ Toastify
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Breadcrumbs from "../../components/Common/Breadcrumb";

const CreateEditGroupTable = () => {
    document.title = "VRRP | Minia";

    const location = useLocation();
    const navigate = useNavigate();
    const editingGroup = location.state?.group || null;

    const [form, setForm] = useState({
        name: "",
        virtualRouterId: "",
        virtualIp: "",
        devices: [],
        acceptMode: false,
        preemption: false,
    });
    const [loading, setLoading] = useState(false);

    // Pre-fill form when editing
    useEffect(() => {
        if (editingGroup) {
            setForm({
                name: editingGroup.name || "",
                virtualRouterId: editingGroup.virtualRouterId || "",
                virtualIp: editingGroup.virtualIp || "",
                devices: editingGroup.devices || [],
                acceptMode: editingGroup.acceptMode || false,
                preemption: editingGroup.preemption || false,
            });
        }
    }, [editingGroup]);

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);

        try {
            if (editingGroup) {
                await putData(`/vrrp/${editingGroup._id}?org=68764b74d712a564f6306593`, form);
                toast.success("Vrrp group updated successfully!")
            } else {
                await postData(`/vrrp?org=68764b74d712a564f6306593`, form);
                toast.success("Vrrp group created successfully!")
            }
            navigate("/vrrp");
        } catch (err) {
            console.error("❌ Error saving group:", err);
            // Try to extract error message from API
            const apiMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to save group";

            toast.error(`❌ ${apiMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs
                    title="VRRP"
                    breadcrumbItem={editingGroup ? "Edit Group" : "New Group"}
                />
                <Card >
                    <CardBody>
                        {/* 🔹 Top bar with Back and Save buttons */}
                        <Row className="mb-4 align-items-center">
                            <Col xs="6">
                                <Button
                                    color="link"
                                    onClick={() => navigate("/vrrp")}
                                    className="p-0 d-flex align-items-center"
                                >
                                    <FaArrowLeft className="me-2" /> Back
                                </Button>
                            </Col>
                            <Col xs="6" className="text-end">
                                <Button onClick={handleSubmit} color="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner size="sm" /> : "Save"}
                                </Button>
                            </Col>
                        </Row>
                        <Form >
                            {/* Name */}
                            <FormGroup>
                                <Label for="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateForm("name", e.target.value)}
                                    required
                                />
                            </FormGroup>

                            {/* Virtual Router ID */}
                            <FormGroup>
                                <Label for="virtualRouterId">Virtual Router ID</Label>
                                <Input
                                    id="virtualRouterId"
                                    type="number"
                                    value={form.virtualRouterId}
                                    onChange={(e) => updateForm("virtualRouterId", e.target.value)}
                                    required
                                />
                            </FormGroup>

                            {/* Virtual IP */}
                            <FormGroup>
                                <Label for="virtualIp">Virtual IP</Label>
                                <Input
                                    id="virtualIp"
                                    type="text"
                                    value={form.virtualIp}
                                    onChange={(e) => updateForm("virtualIp", e.target.value)}
                                    required
                                />
                            </FormGroup>

                            {/* Accept Mode (toggle) */}
                            <FormGroup switch>
                                <Input
                                    type="checkbox"
                                    id="acceptMode"
                                    role="switch"
                                    // checked={form.acceptMode}
                                    onChange={(e) => updateForm("acceptMode", e.target.checked)}
                                />
                                <Label for="acceptMode" check>
                                    Accept Mode
                                </Label>
                            </FormGroup>

                            {/* Preemption (toggle) */}
                            <FormGroup switch>
                                <Input
                                    type="switch"
                                    id="preemption"
                                    // checked={form.preemption}
                                    onChange={(e) => updateForm("preemption", e.target.checked)}
                                />
                                <Label for="preemption" check>
                                    Preemption
                                </Label>
                            </FormGroup>
                        </Form>
                    </CardBody>

                </Card>
            </Container>
        </div>
    );
};

export default CreateEditGroupTable;
