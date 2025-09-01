// ./RuleModal.js
import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
} from "reactstrap";
import { getData } from "../../helpers/api";

const RuleModal = ({ isOpen, toggle, onSave, type, initialData }) => {



    const [appIdentifications, setAppIdentifications] = useState([]);
    const [form, setForm] = useState({
        enabled: true,
        description: "",
        appDestination: "Custom IP/Port/Protocol",
        ipAddress: "",
        protocol: "TCP",
        ports: "",
        category: "",
        serviceClass: "",
        importance: "",
        name: "",
        source: "Any",
        sourceName: "",
        sourceIp: "",
        sourcePorts: "",
        action: "allow",
        destination: "",
        wanInterface: "All (to access the Edge)", // inbound specific
        inboundPorts: "",
        inboundProtocol: "TCP",
    });

    // inside RuleModal
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm(initialData); // editing
            } else {
                setForm({
                    enabled: true,
                    description: "",
                    sourceType: "Any",
                    sourceName: "",
                    sourceIp: "",
                    sourcePorts: "",
                    destinationIp: "",
                    destinationProtocols: [],
                    action: "allow",
                });
            }
        }
    }, [isOpen, initialData]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getData(
                    `/appidentifications?offset=0&limit=200&org=68764b74d712a564f6306593`
                );
                setAppIdentifications(res?.appIdentifications || []);
            } catch (err) {
                console.error("❌ Error fetching app identifications:", err);
            }
        };
        fetchData();
    }, []);

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(form);
        toggle();
    };

    const categories = [...new Set(appIdentifications.map((app) => app.category))];
    const serviceClasses = [
        ...new Set(appIdentifications.map((app) => app.serviceClass)),
    ];
    const names = appIdentifications.map((app) => app.name);

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>
                {type === "outbound" ? "Add Outbound Rule" : "Add Inbound Rule"}
            </ModalHeader>
            <ModalBody>
                <Form>
                    <Row>
                        {/* Left Column */}
                        <Col md={6}>
                            <FormGroup switch>
                                <Input
                                    type="switch"
                                    id="enabledSwitch"
                                    checked={form.enabled}
                                    onChange={(e) => updateForm("enabled", e.target.checked)}
                                />
                                <Label for="enabledSwitch">Enabled</Label>
                            </FormGroup>

                            {/* Outbound Fields */}
                            {type === "outbound" && (
                                <>
                                    <FormGroup>
                                        <Label for="appDestination">App / Destination</Label>
                                        <Input
                                            type="select"
                                            id="appDestination"
                                            value={form.appDestination}
                                            onChange={(e) =>
                                                updateForm("appDestination", e.target.value)
                                            }
                                        >
                                            <option>Custom IP/Port/Protocol</option>
                                            <option>Traffic Tags</option>
                                            <option>Traffic Name</option>
                                            <option>Any</option>
                                        </Input>
                                    </FormGroup>

                                    {/* Dynamic outbound destination fields */}
                                    {form.appDestination === "Custom IP/Port/Protocol" && (
                                        <>
                                            <FormGroup>
                                                <Label for="ipAddress">IP Address</Label>
                                                <Input
                                                    type="text"
                                                    id="ipAddress"
                                                    value={form.ipAddress}
                                                    onChange={(e) =>
                                                        updateForm("ipAddress", e.target.value)
                                                    }
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="protocol">Protocol</Label>
                                                <Input
                                                    type="select"
                                                    id="protocol"
                                                    value={form.protocol}
                                                    onChange={(e) =>
                                                        updateForm("protocol", e.target.value)
                                                    }
                                                >
                                                    <option>ICMP</option>
                                                    <option>TCP</option>
                                                    <option>UDP</option>
                                                </Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="ports">Port Range</Label>
                                                <Input
                                                    type="text"
                                                    id="ports"
                                                    value={form.ports}
                                                    onChange={(e) =>
                                                        updateForm("ports", e.target.value)
                                                    }
                                                    placeholder="e.g. 80, 8000-8080"
                                                />
                                            </FormGroup>
                                        </>
                                    )}

                                    {form.appDestination === "Traffic Tags" && (
                                        <>
                                            <FormGroup>
                                                <Label for="category">Category</Label>
                                                <Input
                                                    type="select"
                                                    id="category"
                                                    value={form.category}
                                                    onChange={(e) =>
                                                        updateForm("category", e.target.value)
                                                    }
                                                >
                                                    <option value="">-- Select Category --</option>
                                                    {categories.map((cat, idx) => (
                                                        <option key={idx} value={cat}>
                                                            {cat}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="serviceClass">Service Class</Label>
                                                <Input
                                                    type="select"
                                                    id="serviceClass"
                                                    value={form.serviceClass}
                                                    onChange={(e) =>
                                                        updateForm("serviceClass", e.target.value)
                                                    }
                                                >
                                                    <option value="">-- Select Service Class --</option>
                                                    {serviceClasses.map((sc, idx) => (
                                                        <option key={idx} value={sc}>
                                                            {sc}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="importance">Importance</Label>
                                                <Input
                                                    type="select"
                                                    id="importance"
                                                    value={form.importance}
                                                    onChange={(e) =>
                                                        updateForm("importance", e.target.value)
                                                    }
                                                >
                                                    <option value="">-- Select Importance --</option>
                                                    <option value="high">High</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="low">Low</option>
                                                </Input>
                                            </FormGroup>
                                        </>
                                    )}

                                    {form.appDestination === "Traffic Name" && (
                                        <FormGroup>
                                            <Label for="name">Name</Label>
                                            <Input
                                                type="select"
                                                id="name"
                                                value={form.name}
                                                onChange={(e) => updateForm("name", e.target.value)}
                                            >
                                                <option value="">-- Select Name --</option>
                                                {names.map((n, idx) => (
                                                    <option key={idx} value={n}>
                                                        {n}
                                                    </option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    )}
                                </>
                            )}

                            {/* Inbound Fields */}
                            {type === "inbound" && (
                                <>
                                    <FormGroup>
                                        <Label for="wanInterface">WAN Interface</Label>
                                        <Input
                                            type="text"
                                            id="wanInterface"
                                            value={form.wanInterface}
                                            disabled
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="inboundPorts">Port Range</Label>
                                        <Input
                                            type="number"
                                            id="inboundPorts"
                                            value={form.inboundPorts}
                                            onChange={(e) =>
                                                updateForm("inboundPorts", e.target.value)
                                            }
                                            placeholder="Enter port (e.g. 80)"
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="inboundProtocol">Protocol</Label>
                                        <Input
                                            type="select"
                                            id="inboundProtocol"
                                            value={form.inboundProtocol}
                                            onChange={(e) =>
                                                updateForm("inboundProtocol", e.target.value)
                                            }
                                        >
                                            <option>TCP</option>
                                            <option>UDP</option>
                                        </Input>
                                    </FormGroup>
                                </>
                            )}

                            <FormGroup>
                                <Label for="action">Action</Label>
                                <Input
                                    type="select"
                                    id="action"
                                    value={form.action}
                                    onChange={(e) => updateForm("action", e.target.value)}
                                >
                                    <option value="allow">Allow</option>
                                    <option value="deny">Deny</option>
                                </Input>
                            </FormGroup>
                        </Col>

                        {/* Right Column (Same for inbound & outbound) */}
                        <Col md={6}>
                            <FormGroup>
                                <Label for="description">Description</Label>
                                <Input
                                    type="textarea"
                                    id="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        updateForm("description", e.target.value)
                                    }
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="source">Source</Label>
                                <Input
                                    type="select"
                                    id="source"
                                    value={form.source}
                                    onChange={(e) => updateForm("source", e.target.value)}
                                >
                                    <option value="Any">Any</option>
                                    <option value="Traffic Name">Traffic Name</option>
                                    <option value="Custom IP/Port">Custom IP/Port</option>
                                </Input>
                            </FormGroup>

                            {/* Conditional fields for Source */}
                            {form.source === "Traffic Name" && (
                                <FormGroup>
                                    <Label for="sourceName">Source Name</Label>
                                    <Input
                                        type="text"
                                        id="sourceName"
                                        value={form.sourceName}
                                        onChange={(e) =>
                                            updateForm("sourceName", e.target.value)
                                        }
                                        placeholder="Enter Traffic Name"
                                    />
                                </FormGroup>
                            )}

                            {form.source === "Custom IP/Port" && (
                                <>
                                    <FormGroup>
                                        <Label for="sourceIp">Source IP Address</Label>
                                        <Input
                                            type="text"
                                            id="sourceIp"
                                            value={form.sourceIp}
                                            onChange={(e) =>
                                                updateForm("sourceIp", e.target.value)
                                            }
                                            placeholder="Enter Source IP"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="sourcePorts">Source Port Range</Label>
                                        <Input
                                            type="text"
                                            id="sourcePorts"
                                            value={form.sourcePorts}
                                            onChange={(e) =>
                                                updateForm("sourcePorts", e.target.value)
                                            }
                                            placeholder="e.g. 80, 8000-8080"
                                        />
                                    </FormGroup>
                                </>
                            )}
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleSave}>
                    Save Rule
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RuleModal;
