import React, { useEffect, useState } from "react";
import {
    Button,
    Container,
    Form,
    FormGroup,
    Label,
    Input,
    Card,
    CardBody,
    Row,
    Col,
    Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { postData, putData } from "../../helpers/api";

const CreateEditQOS = () => {
    document.title = "Create / Edit QOS | Minia";
    const navigate = useNavigate();
    const location = useLocation();

    const existingPolicy = location.state?.policy || null;

    // Default structure
    const defaultForm = {
        name: "",
        description: "",
        advanced: false,
        outbound: {
            realtime: { bandwidthLimitPercent: 30, dscpRewrite: "CS0" },
            "control-signaling": { weight: 40, dscpRewrite: "CS0" },
            "prime-select": { weight: 30, dscpRewrite: "CS0" },
            "standard-select": { weight: 20, dscpRewrite: "CS0" },
            "best-effort": { weight: 10, dscpRewrite: "CS0" },
        },
        inbound: {
            enabled: true,
            enforceRxBandwidthLimit: false,
            policerBandwidthLimitPercent: {
                high: 100,
                medium: 80,
                low: 60,
            },
        },
    };

    // State
    const [formData, setFormData] = useState(defaultForm);
    const [saving, setSaving] = useState(false); // 👈 saving state

    // Prefill if editing
    useEffect(() => {
        if (existingPolicy) {
            setFormData({
                ...defaultForm,
                ...existingPolicy,
                outbound: {
                    ...defaultForm.outbound,
                    ...existingPolicy.outbound,
                },
                inbound: {
                    ...defaultForm.inbound,
                    ...existingPolicy.inbound,
                    policerBandwidthLimitPercent: {
                        ...defaultForm.inbound.policerBandwidthLimitPercent,
                        ...(existingPolicy.inbound?.policerBandwidthLimitPercent || {}),
                    },
                },
            });
        }
    }, [existingPolicy]);

    // Generic update function
    const updateForm = (path, value) => {
        setFormData((prev) => {
            const copy = { ...prev };
            let ref = copy;
            for (let i = 0; i < path.length - 1; i++) {
                ref = ref[path[i]];
            }
            ref[path[path.length - 1]] = value;
            return copy;
        });
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true); // start loader
            if (existingPolicy?._id) {
                await putData(
                    `/qosPolicies/${existingPolicy._id}?org=68764b74d712a564f6306593`,
                    formData
                );
            } else {
                await postData("/qosPolicies?org=68764b74d712a564f6306593", formData);
            }
            navigate("/qos");
        } catch (err) {
            console.error("❌ Error saving QOS policy:", err);
        } finally {
            setSaving(false); // stop loader
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs
                    title="QOS"
                    breadcrumbItem={existingPolicy ? "Edit QOS Policy" : "Create QOS Policy"}
                />

                <Card>
                    <CardBody>
                        {/* Top bar with Back and Save */}
                        <Row className="mb-4 align-items-center">
                            <Col xs="6">
                                <Button
                                    color="link"
                                    onClick={() => navigate("/qos")}
                                    className="p-0 d-flex align-items-center"
                                    disabled={saving}
                                >
                                    <FaArrowLeft className="me-2" /> Back
                                </Button>
                            </Col>
                            <Col xs="6" className="text-end">
                                <Button
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Spinner size="sm" className="me-2" /> Saving...
                                        </>
                                    ) : existingPolicy ? (
                                        "Update Policy"
                                    ) : (
                                        "Save Policy"
                                    )}
                                </Button>
                            </Col>
                        </Row>

                        <Form onSubmit={handleSubmit}>
                            {/* Basic Info */}
                            <FormGroup>
                                <Label for="name">Policy Name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => updateForm(["name"], e.target.value)}
                                    required
                                    disabled={saving}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="description">Description</Label>
                                <Input
                                    type="textarea"
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => updateForm(["description"], e.target.value)}
                                    disabled={saving}
                                />
                            </FormGroup>

                            {/* Outbound Section */}
                            <h5 className="mt-4">WAN Outbound QoS Plan</h5>
                            <FormGroup>
                                <Label>
                                    Realtime Bandwidth Limit: {formData.outbound.realtime.bandwidthLimitPercent}%
                                </Label>
                                <Input
                                    type="range"
                                    min="10"
                                    max="70"
                                    step="10"
                                    value={formData.outbound.realtime.bandwidthLimitPercent}
                                    onChange={(e) =>
                                        updateForm(["outbound", "realtime", "bandwidthLimitPercent"], Number(e.target.value))
                                    }
                                    disabled={saving}
                                />
                            </FormGroup>

                            <h6>Data Queues (must total 100%)</h6>
                            {["control-signaling", "prime-select", "standard-select", "best-effort"].map((q) => (
                                <FormGroup key={q}>
                                    <Label>
                                        {q} – {formData.outbound[q].weight}%
                                    </Label>
                                    <Input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="10"
                                        value={formData.outbound[q].weight}
                                        onChange={(e) =>
                                            updateForm(["outbound", q, "weight"], Number(e.target.value))
                                        }
                                        disabled={saving}
                                    />
                                </FormGroup>
                            ))}

                            {/* Inbound Section */}
                            <h5 className="mt-4">WAN Inbound QoS Plan</h5>
                            <FormGroup switch>
                                <Input
                                    type="switch"
                                    id="inboundEnabled"
                                    label="Inbound QOS Plan enabled"
                                    checked={formData.inbound.enabled}
                                    onChange={(e) => updateForm(["inbound", "enabled"], e.target.checked)}
                                    disabled={saving}
                                />
                            </FormGroup>
                            <FormGroup switch>
                                <Input
                                    type="switch"
                                    id="enforceRx"
                                    label="Enforce RX Bandwidth Limit"
                                    checked={formData.inbound.enforceRxBandwidthLimit}
                                    onChange={(e) =>
                                        updateForm(["inbound", "enforceRxBandwidthLimit"], e.target.checked)
                                    }
                                    disabled={saving}
                                />
                            </FormGroup>

                            <h6>Importance Bandwidth Limits</h6>
                            {["high", "medium", "low"].map((level) => (
                                <FormGroup key={level}>
                                    <Label>
                                        {level} – {formData.inbound.policerBandwidthLimitPercent[level]}%
                                    </Label>
                                    <Input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="10"
                                        value={formData.inbound.policerBandwidthLimitPercent[level]}
                                        onChange={(e) =>
                                            updateForm(["inbound", "policerBandwidthLimitPercent", level], Number(e.target.value))
                                        }
                                        disabled={saving}
                                    />
                                </FormGroup>
                            ))}
                        </Form>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default CreateEditQOS;
