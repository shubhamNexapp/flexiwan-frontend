import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { putData } from "../../helpers/api";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ipRegex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  group: Yup.string(),
  encryptionMethod: Yup.string().required("Encryption method is required"),
  vxlanPort: Yup.number().min(1).max(65535).required(),
  tunnelRange: Yup.string().matches(ipRegex, "Invalid IP or CIDR").required(),
});

const EditOrganization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const formik = useFormik({
    initialValues: {
      name: state?.orgData?.name || "",
      description: state?.orgData?.description || "",
      group: state?.orgData?.group || "",
      encryptionMethod: state?.orgData?.encryptionMethod || "ikev2",
      vxlanPort: state?.orgData?.vxlan_port || 4789,
      tunnelRange: state?.orgData?.tunnelRange || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await putData(`/organizations/${id}`, values);
        toast.success("Organization updated successfully!");
        navigate("/organizations");
      } catch (err) {
        toast.error("Failed to update organization.");
      }
    },
  });

  const { values, handleChange, handleSubmit, errors, touched } = formik;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Forms" breadcrumbItem="Edit Organization" />
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <h4>Edit Organization</h4>
              </CardHeader>
              <CardBody>
                <form onSubmit={formik.handleSubmit}>
                  <Row>
                    <Col md={6}>
                      {/* Name */}
                      <div className="mb-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={values.name}
                          onChange={handleChange}
                          invalid={touched.name && !!errors.name}
                        />
                        <FormFeedback>{errors.name}</FormFeedback>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          type="text"
                          value={values.description}
                          onChange={handleChange}
                          invalid={touched.description && !!errors.description}
                        />
                        <FormFeedback>{errors.description}</FormFeedback>
                      </div>

                      {/* Group */}
                      <div className="mb-3">
                        <Label htmlFor="group">Group</Label>
                        <Input
                          id="group"
                          name="group"
                          type="text"
                          value={values.group}
                          onChange={handleChange}
                          invalid={touched.group && !!errors.group}
                        />
                        <FormFeedback>{errors.group}</FormFeedback>
                      </div>
                    </Col>

                    <Col md={6}>
                      {/* Encryption Method */}
                      <div className="mb-3">
                        <Label htmlFor="encryptionMethod">
                          Encryption Method
                        </Label>
                        <Input
                          id="encryptionMethod"
                          name="encryptionMethod"
                          type="select"
                          value={values.encryptionMethod}
                          onChange={handleChange}
                          invalid={
                            touched.encryptionMethod &&
                            !!errors.encryptionMethod
                          }
                        >
                          <option value="ikev2">ikev2</option>
                          <option value="ikev1">ikev1</option>
                          <option value="openvpn">OpenVPN</option>
                        </Input>
                        <FormFeedback>{errors.encryptionMethod}</FormFeedback>
                      </div>

                      {/* VXLAN Port */}
                      <div className="mb-3">
                        <Label htmlFor="vxlanPort">VXLAN Port</Label>
                        <Input
                          id="vxlanPort"
                          name="vxlanPort"
                          type="number"
                          value={values.vxlanPort}
                          onChange={handleChange}
                          invalid={touched.vxlanPort && !!errors.vxlanPort}
                        />
                        <FormFeedback>{errors.vxlanPort}</FormFeedback>
                      </div>

                      {/* Tunnel Range */}
                      <div className="mb-3">
                        <Label htmlFor="tunnelRange">
                          Tunnel Range (e.g. 10.100.0.0/16)
                        </Label>
                        <Input
                          id="tunnelRange"
                          name="tunnelRange"
                          type="text"
                          value={values.tunnelRange}
                          onChange={handleChange}
                          invalid={touched.tunnelRange && !!errors.tunnelRange}
                        />
                        <FormFeedback>{errors.tunnelRange}</FormFeedback>
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div className="text-end">
                        <Button color="primary" type="submit">
                          Update
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditOrganization;
