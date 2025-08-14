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
  Badge,
} from "reactstrap";
import { getData } from "../../../../helpers/api";

const OSPF = ({ _id }) => {
  document.title = "Devices | Minia";

  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Local editable state for OSPF
  const [ospf, setOspf] = useState({
    helloInterval: "",
    deadInterval: "",
    redistributeBgp: false,
    routerID: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData(`devices/${_id}`);
        const d = response[0];
        setDeviceData(d);

        // initialize ospf state safely
        const initialOspf = d?.ospf || {};
        setOspf({
          helloInterval:
            typeof initialOspf.helloInterval !== "undefined"
              ? String(initialOspf.helloInterval)
              : "",
          deadInterval:
            typeof initialOspf.deadInterval !== "undefined"
              ? String(initialOspf.deadInterval)
              : "",
          redistributeBgp: Boolean(initialOspf.redistributeBgp),
          routerID: initialOspf.routerID || initialOspf.custom || "",
        });
      } catch (err) {
        setError("Failed to load device data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [_id]);

  // Input helper: allow numbers only (integer)
  const onlyNumbers = (value) => {
    return value.replace(/[^\d]/g, "");
  };

  const handleChange = (field, value) => {
    // only apply numeric filter for interval fields
    if (field === "helloInterval" || field === "deadInterval") {
      value = onlyNumbers(value);
    }
    setOspf((s) => ({ ...s, [field]: value }));
    setValidationErrors((v) => ({ ...v, [field]: undefined }));
  };

  // toggle handler for boolean fields
  const handleToggle = (field) => {
    setOspf((s) => ({ ...s, [field]: !s[field] }));
  };

  const validate = () => {
    const errs = {};
    if (ospf.helloInterval === "" || isNaN(Number(ospf.helloInterval))) {
      errs.helloInterval = "Hello interval is required and must be a number.";
    } else if (Number(ospf.helloInterval) < 0) {
      errs.helloInterval = "Must be 0 or higher.";
    }

    if (ospf.deadInterval === "" || isNaN(Number(ospf.deadInterval))) {
      errs.deadInterval = "Dead interval is required and must be a number.";
    } else if (Number(ospf.deadInterval) < 0) {
      errs.deadInterval = "Must be 0 or higher.";
    }

    if (
      !errs.deadInterval &&
      !errs.helloInterval &&
      Number(ospf.deadInterval) <= Number(ospf.helloInterval)
    ) {
      errs.deadInterval =
        "Dead interval should be greater than hello interval.";
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Build payload - adapt keys to your API if needed
    const payload = {
      helloInterval: Number(ospf.helloInterval),
      deadInterval: Number(ospf.deadInterval),
      redistributeBgp: Boolean(ospf.redistributeBgp),
      routerID: ospf.routerID,
    };

    try {
      setSaving(true);
      // Replace the console.log with your real API call (axios.post/put)
      console.log("Saving OSPF payload for device", _id, payload);

      // Example stub — uncomment & adapt to call your API:
      // await axios.post(`/api/devices/${_id}/ospf`, payload);

      // Update local deviceData.ospf so UI remains in-sync
      setDeviceData((d) => ({ ...d, ospf: payload }));
    } catch (err) {
      console.error("Failed to save OSPF settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset ospf to deviceData values
    const initialOspf = deviceData?.ospf || {};
    setOspf({
      helloInterval:
        typeof initialOspf.helloInterval !== "undefined"
          ? String(initialOspf.helloInterval)
          : "",
      deadInterval:
        typeof initialOspf.deadInterval !== "undefined"
          ? String(initialOspf.deadInterval)
          : "",
      redistributeBgp: Boolean(initialOspf.redistributeBgp),
      routerID: initialOspf.routerID || initialOspf.custom || "",
    });
    setValidationErrors({});
  };

  if (loading) return <Spinner className="m-4" />;
  if (error) return <p className="text-danger m-4">{error}</p>;

  return (
    <>
      <Card className="shadow-sm">
        <CardBody>
          <Row className="mb-3">
            <Col md={6}>
              <FormGroup>
                <Label for="helloInterval">Hello Interval (s)</Label>
                <Input
                  id="helloInterval"
                  value={ospf.helloInterval}
                  onChange={(e) =>
                    handleChange("helloInterval", e.target.value)
                  }
                  placeholder="Enter hello interval (seconds)"
                />
                {validationErrors.helloInterval && (
                  <FormText color="danger">
                    {validationErrors.helloInterval}
                  </FormText>
                )}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label for="deadInterval">Dead Interval (s)</Label>
                <Input
                  id="deadInterval"
                  value={ospf.deadInterval}
                  onChange={(e) => handleChange("deadInterval", e.target.value)}
                  placeholder="Enter dead interval (seconds)"
                />
                {validationErrors.deadInterval && (
                  <FormText color="danger">
                    {validationErrors.deadInterval}
                  </FormText>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <FormGroup className="d-flex align-items-center">
                <Label className="me-3 mb-0">Redistribute BGP Routes</Label>

                {/* Bootstrap 5 switch (controlled) */}
                <div className="form-check form-switch mb-0">
                  <input
                    id="redistributeBgp"
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    defaultChecked
                    // checked={ospf.redistributeBgp}
                    // onChange={() => handleToggle("redistributeBgp")}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="redistributeBgp"
                  />
                </div>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label for="routerID">Router ID</Label>
                <Input
                  id="routerID"
                  value={ospf.routerID}
                  onChange={(e) => handleChange("routerID", e.target.value)}
                  placeholder=""
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
    </>
  );
};

export default OSPF;
