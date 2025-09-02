// ./EditInstalledConfigurations.js
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
    Collapse,
} from "reactstrap";
import { putData } from "../../helpers/api";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const EditInstalledConfigurations = () => {
    document.title = "Edit Installed Application | Minia";

    const location = useLocation();
    const navigate = useNavigate();
    const editingApp = location.state?.app || null;
    const fromRoute = location.state?.from || "/installed"

    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(false);

    // Collapse state for authentications
    const [openAuth, setOpenAuth] = useState({
        gsuite: false,
        office365: false,
        flexiManage: false,
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (editingApp?.configuration) {
            setConfig(editingApp.configuration);
        }
    }, [editingApp]);

    const updateConfig = (field, value) => {
        setConfig((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateAuthConfig = (provider, field, value) => {
        setConfig((prev) => ({
            ...prev,
            authentications: {
                ...prev.authentications,
                [provider]: {
                    ...prev.authentications[provider],
                    [field]: value,
                },
            },
        }));
    };

    const updateAuthDomain = (provider, index, field, value) => {
        const domains = [...(config.authentications[provider].domains || [])];
        domains[index] = { ...domains[index], [field]: value };
        updateAuthConfig(provider, "domains", domains);
    };

    const addAuthDomain = (provider) => {
        const domains = [...(config.authentications[provider].domains || [])];
        domains.push({ domain: "", groups: "" });
        updateAuthConfig(provider, "domains", domains);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ Send only configuration object as payload
            await putData(
                `/appstore/purchased/${editingApp._id}`,
                config
            );
            toast.success("Application configuration updated successfully!");
            if (fromRoute === "/installed") {
                navigate("/installed");
            } else {
                navigate("/available");
            }
        } catch (err) {
            console.error("❌ Error updating configuration:", err);
            const apiMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to update configuration";

            toast.error(`❌ ${apiMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Constant base URL for Portal Access Link
    const basePortalUrl = "https://vpn.flexiwan.com/login?workspace=";

    const back = () => {
        if (fromRoute === "/installed") {
            navigate("/installed");
        } else {
            navigate("/available");
        }
    }
    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs
                    title="Applications"
                    breadcrumbItem="Remote Worker VPN Configuration"
                />
                <Card>
                    <CardBody>
                        {/* Top bar with Back and Save buttons */}
                        <Row className="mb-4 align-items-center">
                            <Col xs="6">
                                <Button
                                    color="link"
                                    onClick={back}
                                    className="p-0 d-flex align-items-center"
                                >
                                    <FaArrowLeft className="me-2" /> Back
                                </Button>
                            </Col>
                            <Col xs="6" className="text-end">
                                <Button
                                    onClick={handleSubmit}
                                    color="primary"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size="sm" /> : "Save"}
                                </Button>
                            </Col>
                        </Row>

                        {/* Edit form */}
                        <Form>
                            {/* Workspace Name */}
                            <FormGroup>
                                <Label>Workspace name</Label>
                                <Input
                                    type="text"
                                    value={config.networkId || ""}
                                    onChange={(e) => updateConfig("networkId", e.target.value)}
                                />
                            </FormGroup>

                            {/* Auto-generated Portal Access Link */}
                            <FormGroup>
                                <Label>Portal Access Link</Label>
                                <Input
                                    type="text"
                                    value={
                                        config.networkId
                                            ? `${basePortalUrl}${config.networkId}`
                                            : ""
                                    }
                                    readOnly
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Server Port</Label>
                                <Input
                                    type="text"
                                    value={config.serverPort || ""}
                                    onChange={(e) => updateConfig("serverPort", e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup check>
                                <Input
                                    type="checkbox"
                                    checked={config.routeAllTrafficOverVpn || false}
                                    onChange={(e) =>
                                        updateConfig("routeAllTrafficOverVpn", e.target.checked)
                                    }
                                />
                                <Label check>Route All Traffic Over VPN</Label>
                            </FormGroup>

                            <FormGroup>
                                <Label>DNS IPs</Label>
                                <Input
                                    type="text"
                                    value={config.dnsIps || ""}
                                    onChange={(e) => updateConfig("dnsIps", e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>DNS Domains</Label>
                                <Input
                                    type="text"
                                    value={config.dnsDomains || ""}
                                    onChange={(e) => updateConfig("dnsDomains", e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup check>
                                <Input
                                    type="checkbox"
                                    checked={config.dnsBlockOutside || false}
                                    onChange={(e) =>
                                        updateConfig("dnsBlockOutside", e.target.checked)
                                    }
                                />
                                <Label check>DNS Block Outside</Label>
                            </FormGroup>

                            <FormGroup>
                                <Label>Allowed Portal Users</Label>
                                <Input
                                    type="number"
                                    value={config.allowedPortalUsers || ""}
                                    onChange={(e) =>
                                        updateConfig("allowedPortalUsers", e.target.value)
                                    }
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Keys Exist</Label>
                                <Input
                                    type="number"
                                    value={config.keysExist || ""}
                                    onChange={(e) => updateConfig("keysExist", e.target.value)}
                                />
                            </FormGroup>

                            {/* Authentication Sections */}
                            <h5 className="mt-4">Authentications</h5>

                            {["gsuite", "office365", "flexiManage"].map((provider) => (
                                <div key={provider} className="mb-3 border p-2 rounded">
                                    <h6
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                            setOpenAuth((prev) => ({
                                                ...prev,
                                                [provider]: !prev[provider],
                                            }))
                                        }
                                    >
                                        {provider.toUpperCase()}
                                    </h6>
                                    <Collapse isOpen={openAuth[provider]}>
                                        <FormGroup check>
                                            <Input
                                                type="checkbox"
                                                checked={
                                                    config.authentications?.[provider]?.enabled || false
                                                }
                                                onChange={(e) =>
                                                    updateAuthConfig(provider, "enabled", e.target.checked)
                                                }
                                            />
                                            <Label check>Enabled</Label>
                                        </FormGroup>

                                        {/* Domains for office365 & gsuite */}
                                        {["office365", "gsuite"].includes(provider) && (
                                            <div className="mt-2">
                                                <Label>Domains</Label>
                                                {(
                                                    config.authentications?.[provider]?.domains || []
                                                ).map((d, index) => (
                                                    <Row key={index} className="mb-2">
                                                        <Col>
                                                            <Input
                                                                type="text"
                                                                placeholder="Domain"
                                                                value={d.domain || ""}
                                                                onChange={(e) =>
                                                                    updateAuthDomain(
                                                                        provider,
                                                                        index,
                                                                        "domain",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <Input
                                                                type="text"
                                                                placeholder="Groups"
                                                                value={d.groups || ""}
                                                                onChange={(e) =>
                                                                    updateAuthDomain(
                                                                        provider,
                                                                        index,
                                                                        "groups",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                ))}
                                                <Button
                                                    size="sm"
                                                    color="secondary"
                                                    onClick={() => addAuthDomain(provider)}
                                                >
                                                    Add Domain
                                                </Button>
                                            </div>
                                        )}
                                    </Collapse>
                                </div>
                            ))}
                        </Form>
                    </CardBody>
                </Card>
            </Container>
        </div >
    );
};

export default EditInstalledConfigurations;
