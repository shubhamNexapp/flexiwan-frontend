// BGP.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  FormText,
  Table,
} from "reactstrap";
import { getData } from "../../../../helpers/api";

const BGP = ({ _id }) => {
  document.title = "Devices | Minia";

  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [bgp, setBgp] = useState({
    enable: false,
    localASN: "",
    keepaliveInterval: "",
    holdInterval: "",
    redistributeOspf: false,
    custom: "",
    neighbors: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  // neighbor inputs
  const [newNeighbor, setNewNeighbor] = useState({ peerIp: "", remoteAs: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        const d = response[0];
        setDeviceData(d);

        const initial = d?.bgp || {};
        setBgp({
          enable: Boolean(initial.enable),
          localASN: initial.localASN ?? "",
          keepaliveInterval:
            typeof initial.keepaliveInterval !== "undefined"
              ? String(initial.keepaliveInterval)
              : "",
          holdInterval:
            typeof initial.holdInterval !== "undefined"
              ? String(initial.holdInterval)
              : "",
          redistributeOspf: Boolean(initial.redistributeOspf),
          custom: initial.custom ?? "",
          neighbors: Array.isArray(initial.neighbors) ? initial.neighbors : [],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load device data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [_id]);

  const onlyNumbers = (value) => value.replace(/[^\d]/g, "");

  const handleChange = (field, value) => {
    // numeric sanitization for intervals and ASN
    if (
      ["keepaliveInterval", "holdInterval", "localASN", "remoteAs"].includes(
        field
      )
    ) {
      value = onlyNumbers(String(value));
    }
    setBgp((s) => ({ ...s, [field]: value }));
    setValidationErrors((v) => ({ ...v, [field]: undefined }));
  };

  const toggleField = (field) => {
    setBgp((s) => ({ ...s, [field]: !s[field] }));
  };

  const validate = () => {
    const errs = {};
    if (bgp.enable) {
      if (bgp.localASN === "") errs.localASN = "Local ASN is required.";
      if (bgp.keepaliveInterval === "" || isNaN(Number(bgp.keepaliveInterval)))
        errs.keepaliveInterval = "Keepalive interval required (number).";
      if (bgp.holdInterval === "" || isNaN(Number(bgp.holdInterval)))
        errs.holdInterval = "Hold interval required (number).";
      if (
        !errs.keepaliveInterval &&
        !errs.holdInterval &&
        Number(bgp.holdInterval) <= Number(bgp.keepaliveInterval)
      ) {
        errs.holdInterval = "Hold interval should be greater than keepalive.";
      }
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddNeighbor = () => {
    if (!newNeighbor.peerIp || !newNeighbor.remoteAs) {
      alert("Please fill both Peer IP and Remote ASN.");
      return;
    }
    setBgp((s) => ({ ...s, neighbors: [...s.neighbors, { ...newNeighbor }] }));
    setNewNeighbor({ peerIp: "", remoteAs: "" });
  };

  const handleDeleteNeighbor = (idx) => {
    setBgp((s) => {
      const arr = [...s.neighbors];
      arr.splice(idx, 1);
      return { ...s, neighbors: arr };
    });
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      enable: Boolean(bgp.enable),
      localASN: bgp.localASN,
      keepaliveInterval: Number(bgp.keepaliveInterval || 0),
      holdInterval: Number(bgp.holdInterval || 0),
      redistributeOspf: Boolean(bgp.redistributeOspf),
      custom: bgp.custom,
      neighbors: bgp.neighbors.map((n) => ({
        peerIp: n.peerIp,
        remoteAs: n.remoteAs,
      })),
    };

    try {
      setSaving(true);
      // TODO: replace with actual API call, for example:
      // await axios.post(`/api/devices/${_id}/bgp`, { payload });
      console.log("Saving BGP payload", payload);

      // update local copy so UI reflects saved values
      setDeviceData((d) => ({ ...d, bgp: payload }));
    } catch (err) {
      console.error("Failed saving BGP:", err);
      // set error UI if needed
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // reset to deviceData values
    const initial = deviceData?.bgp || {};
    setBgp({
      enable: Boolean(initial.enable),
      localASN: initial.localASN ?? "",
      keepaliveInterval:
        typeof initial.keepaliveInterval !== "undefined"
          ? String(initial.keepaliveInterval)
          : "",
      holdInterval:
        typeof initial.holdInterval !== "undefined"
          ? String(initial.holdInterval)
          : "",
      redistributeOspf: Boolean(initial.redistributeOspf),
      custom: initial.custom ?? "",
      neighbors: Array.isArray(initial.neighbors) ? initial.neighbors : [],
    });
    setValidationErrors({});
    setNewNeighbor({ peerIp: "", remoteAs: "" });
  };

  if (loading) return <Spinner className="m-4" />;
  if (error) return <p className="text-danger m-4">{error}</p>;


  return (
    <Card className="shadow-sm">
      <CardBody>
        <Row className="mb-3">
          <Col md={4}>
            <FormGroup className="d-flex flex-column">
              <Label className="mb-1">BGP Enabled</Label>
              <div className="form-check form-switch">
                <input
                  id="bgpEnable"
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  defaultChecked
                  // checked={bgp.enable}
                  // onChange={() => toggleField("enable")}
                />
                <label className="form-check-label" htmlFor="bgpEnable" />
              </div>
            </FormGroup>
          </Col>

          <Col md={4}>
            <FormGroup className="d-flex flex-column">
              <Label className="mb-1">Redistribute OSPF</Label>
              <div className="form-check form-switch">
                <input
                  id="redistributeOspf"
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={bgp.redistributeOspf}
                  onChange={() => toggleField("redistributeOspf")}
                />
                <label
                  className="form-check-label"
                  htmlFor="redistributeOspf"
                />
              </div>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label for="localASN">Local ASN</Label>
              <Input
                id="localASN"
                value={bgp.localASN}
                onChange={(e) => handleChange("localASN", e.target.value)}
                placeholder="Enter Local ASN"
              />
              {validationErrors.localASN && (
                <FormText color="danger">{validationErrors.localASN}</FormText>
              )}
            </FormGroup>
          </Col>

          <Col md={4}>
            <FormGroup>
              <Label for="keepaliveInterval">Keepalive (s)</Label>
              <Input
                id="keepaliveInterval"
                value={bgp.keepaliveInterval}
                onChange={(e) =>
                  handleChange("keepaliveInterval", e.target.value)
                }
                placeholder="e.g. 30"
              />
              {validationErrors.keepaliveInterval && (
                <FormText color="danger">
                  {validationErrors.keepaliveInterval}
                </FormText>
              )}
            </FormGroup>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <FormGroup>
              <Label for="holdInterval">Hold Interval (s)</Label>
              <Input
                id="holdInterval"
                value={bgp.holdInterval}
                onChange={(e) => handleChange("holdInterval", e.target.value)}
                placeholder="e.g. 90"
              />
              {validationErrors.holdInterval && (
                <FormText color="danger">
                  {validationErrors.holdInterval}
                </FormText>
              )}
            </FormGroup>
          </Col>

          <Col md={4}>
            <FormGroup>
              <Label for="custom">Custom</Label>
              <Input
                id="custom"
                value={bgp.custom}
                onChange={(e) => handleChange("custom", e.target.value)}
                placeholder="Any custom configuration"
              />
            </FormGroup>
          </Col>
        </Row>
        <div className="d-flex justify-content-end gap-2">
          <Button color="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default BGP;
