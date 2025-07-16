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
import { postData } from "../../helpers/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// IP regex (accepts IP or CIDR)
const ipRegex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  group: Yup.string(),
  encryptionMethod: Yup.string().required("Encryption method is required"),
  vxlanPort: Yup.number()
    .typeError("Port must be a number")
    .min(1, "Port must be >= 1")
    .max(65535, "Port must be <= 65535")
    .required("VXLAN port is required"),
  tunnelRange: Yup.string()
    .matches(ipRegex, "Invalid IP or CIDR format")
    .required("Tunnel range is required"),
});

const FormElements = () => {
  const navigate = useNavigate();

  document.title = "Add Organization | Minia React Template";

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      group: "",
      encryptionMethod: "ikev2",
      vxlanPort: 4789,
      tunnelRange: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log("Submitted Values:==", values);
        const response = await postData("/organizations", values);
        console.log("Response from API:===", response);
        toast.success("Organization created successfully!");
        navigate("/organizations"); // or wherever you want to redirect
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to create organization");
        return;
      }
    },
  });

  const { values, handleChange, handleSubmit, errors, touched } = formik;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Forms" breadcrumbItem="Add Organization" />
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <h4 className="card-title">Add Organization</h4>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
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
                          Submit
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

export default FormElements;
