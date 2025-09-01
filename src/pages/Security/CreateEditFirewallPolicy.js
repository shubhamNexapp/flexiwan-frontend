// ./CreateEditFirewall.js
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
  Table,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { getData, postData, putData } from "../../helpers/api";
import RuleModal from "./RuleModal";

const CreateEditFirewall = () => {
  document.title = "Create / Edit Firewall | Minia";
  const navigate = useNavigate();
  const location = useLocation();

  const existingPolicy = location.state?.policy || null;

  const defaultForm = {
    name: "",
    description: "",
    outboundRules: [],
    inboundRules: [],
  };

  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const [outboundModalOpen, setOutboundModalOpen] = useState(false);
  const [inboundModalOpen, setInboundModalOpen] = useState(false);
  const [editRuleIndex, setEditRuleIndex] = useState(null);
  const [editType, setEditType] = useState(null);

  // hydrate form if editing
  useEffect(() => {
    if (existingPolicy) {
      const outbound = (existingPolicy.rules || [])
        .filter((r) => r.direction === "outbound")
        .map(mapApiRuleToUi);
      const inbound = (existingPolicy.rules || [])
        .filter((r) => r.direction === "inbound")
        .map(mapApiRuleToUi);

      setFormData({
        name: existingPolicy.name,
        description: existingPolicy.description,
        outboundRules: outbound,
        inboundRules: inbound,
      });
    }
  }, [existingPolicy]);

  // mapper: API -> UI form state
  const mapApiRuleToUi = (rule) => {
    return {
      description: rule.description,
      enabled: rule.enabled,
      action: rule.action,
      sourceType: rule.classification.source.trafficId
        ? "Traffic Name"
        : rule.classification.source.ipProtoPort
        ? "Custom IP/Port"
        : "Any",
      sourceName: rule.classification.source.trafficId || "",
      sourceIp: rule.classification.source.ipProtoPort?.ip || "",
      sourcePorts: rule.classification.source.ipProtoPort?.ports?.join(",") || "",
      destinationIp: rule.classification.destination.ipProtoPort?.ip || "",
      destinationProtocols: rule.classification.destination.ipProtoPort?.protocols || [],
    };
  };

  // mapper: UI form state -> API payload
  const mapUiRuleToApi = (uiRule, direction) => {
    const classification = {
      source: {},
      destination: {},
    };

    if (uiRule.sourceType === "Traffic Name") {
      classification.source.trafficId = uiRule.sourceName;
    } else if (uiRule.sourceType === "Custom IP/Port") {
      classification.source.ipProtoPort = {
        ip: uiRule.sourceIp,
        ports: uiRule.sourcePorts
          ? uiRule.sourcePorts.split(",").map((p) => p.trim())
          : [],
      };
    } else {
      classification.source = {}; // Any
    }

    classification.destination.ipProtoPort = {
      ip: uiRule.destinationIp,
      protocols: uiRule.destinationProtocols,
    };

    return {
      description: uiRule.description,
      priority: 0,
      enabled: uiRule.enabled,
      direction,
      action: uiRule.action,
      classification,
    };
  };

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // add or update rule
  const saveRule = (rule, type) => {
    setFormData((prev) => {
      const copy = [...prev[type + "Rules"]];
      if (editRuleIndex !== null) {
        copy[editRuleIndex] = rule;
      } else {
        copy.push(rule);
      }
      return { ...prev, [type + "Rules"]: copy };
    });
    setEditRuleIndex(null);
    setEditType(null);
    type === "outbound" ? setOutboundModalOpen(false) : setInboundModalOpen(false);
  };

  const deleteRule = (type, index) => {
    const rules = [...formData[type + "Rules"]];
    rules.splice(index, 1);
    setFormData({ ...formData, [type + "Rules"]: rules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const allRules = [
        ...formData.outboundRules.map((r) => mapUiRuleToApi(r, "outbound")),
        ...formData.inboundRules.map((r) => mapUiRuleToApi(r, "inbound")),
      ];

      const payload = {
        name: formData.name,
        description: formData.description,
        rules: allRules,
      };

      if (existingPolicy?._id) {
        await putData(
          `/firewallpolicies/${existingPolicy._id}?org=68764b74d712a564f6306593`,
          payload
        );
      } else {
        await postData(
          "/firewallpolicies?org=68764b74d712a564f6306593",
          payload
        );
      }
      navigate("/firewall");
    } catch (err) {
      console.error("❌ Error saving Firewall policy:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderRulesTable = (type) => (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">
          {type === "outbound" ? "Outbound Rules" : "Inbound Rules"}
        </h5>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditRuleIndex(null);
            setEditType(type);
            type === "outbound"
              ? setOutboundModalOpen(true)
              : setInboundModalOpen(true);
          }}
        >
          {type === "outbound" ? "+ Add Outbound Rule" : "+ Add Inbound Rule"}
        </Button>
      </div>

      <Table bordered responsive>
        <thead>
          <tr>
            <th>Source</th>
            <th>Destination</th>
            <th>Action</th>
            <th>Description</th>
            <th>Rule Actions</th>
          </tr>
        </thead>
        <tbody>
          {formData[type + "Rules"].length > 0 ? (
            formData[type + "Rules"].map((rule, i) => (
              <tr key={i}>
                <td>{rule.sourceType}</td>
                <td>{rule.destinationIp}</td>
                <td>{rule.action}</td>
                <td>{rule.description}</td>
                <td>
                  <Button
                    color="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setEditRuleIndex(i);
                      setEditType(type);
                      type === "outbound"
                        ? setOutboundModalOpen(true)
                        : setInboundModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => deleteRule(type, i)}
                    disabled={saving}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No rules added
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Firewall"
          breadcrumbItem={
            existingPolicy ? "Edit Firewall Policy" : "Create Firewall Policy"
          }
        />

        <Card>
          <CardBody>
            <Row className="mb-4 align-items-center">
              <Col xs="6">
                <Button
                  color="link"
                  onClick={() => navigate("/firewall")}
                  className="p-0 d-flex align-items-center"
                  disabled={saving}
                >
                  <FaArrowLeft className="me-2" /> Back
                </Button>
              </Col>
              <Col xs="6" className="text-end">
                <Button color="primary" onClick={handleSubmit} disabled={saving}>
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
              <FormGroup>
                <Label for="name">Policy Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
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
                  onChange={(e) => updateForm("description", e.target.value)}
                  disabled={saving}
                />
              </FormGroup>

              {renderRulesTable("outbound")}
              {renderRulesTable("inbound")}
            </Form>
          </CardBody>
        </Card>
      </Container>

      {/* Rule Modals */}
      <RuleModal
        isOpen={outboundModalOpen}
        toggle={() => setOutboundModalOpen(false)}
        onSave={(rule) => saveRule(rule, "outbound")}
        type="outbound"
        initialData={editRuleIndex !== null ? formData.outboundRules[editRuleIndex] : null}
      />
      <RuleModal
        isOpen={inboundModalOpen}
        toggle={() => setInboundModalOpen(false)}
        onSave={(rule) => saveRule(rule, "inbound")}
        type="inbound"
        initialData={editRuleIndex !== null ? formData.inboundRules[editRuleIndex] : null}
      />
    </div>
  );
};

export default CreateEditFirewall;
