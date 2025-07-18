import React, { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container,
  Row, Label, Input, Button, FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { postData, getData } from "../../helpers/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LoaderHide, LoaderShow } from "../../helpers/common.constants";
import loader from "../../assets/images/instaone-loader.svg";


const permissionApis = {
  account: "/members/options/account",
  group: "/members/options/group",
  organization: "/members/options/organization",
};

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  jobTitle: Yup.string(),
  permission: Yup.string().oneOf(["account", "group", "organization"]).required("Permission is required"),
  entity: Yup.string().required("Entity is required"),
  role: Yup.string().oneOf(["owner", "viewer"]).required("Role is required"),
});

const AddUser = () => {
  const navigate = useNavigate();
  const [loadingTargets, setLoadingTargets] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      jobTitle: "",
      permission: "account",
      entity: "",
      role: "owner",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        LoaderShow()
        const data = {
          email: values.email,
          userFirstName: values.firstName,
          userLastName: values.lastName,
          userPermissionTo: values.permission,
          userEntity: values.entity,
          userRole: values.role,
          userJobTitle: values.jobTitle,
        };

        await postData("/members", data);
        LoaderHide()
        toast.success("User added successfully!");
        navigate("/users");
      } catch (err) {
        LoaderHide()
        console.error(err);
        toast.error("Failed to add user.");
      }
    },
  });

  const { values, handleChange, handleSubmit, errors, touched, setFieldValue } = formik;

  useEffect(() => {
    fetchAndSetEntity(values.permission);
  }, []);

  const fetchAndSetEntity = async (permission) => {
    setLoadingTargets(true);
    try {
      LoaderShow()
      const response = await getData(permissionApis[permission]);
      LoaderHide()
      const entityName = response?.[0]?.value || "";
      setFieldValue("entity", entityName); // Set entity inside formik
    } catch (err) {
      console.error("Error fetching entity:", err);
      toast.error("Failed to load entity.");
      setFieldValue("entity", "");
    } finally {
      LoaderHide()
      setLoadingTargets(false);
    }
  };

  const handlePermissionChange = async (e) => {
    const permission = e.target.value;
    setFieldValue("permission", permission);
    await fetchAndSetEntity(permission);
  };

  return (
    <div className="page-content">
      <div
        id="hideloding"
        className="loding-display"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255,255,255,0.7)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          display: "flex",
        }}
      >
        <img src={loader} alt="loader-img" style={{ width: "100px", height: "100px" }} />
      </div>
      <Container fluid>
        <Breadcrumbs title="Forms" breadcrumbItem="Add User" />
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <h4 className="card-title">Add User</h4>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      {/* Email */}
                      <div className="mb-3">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          invalid={touched.email && !!errors.email}
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
                      </div>

                      {/* First Name */}
                      <div className="mb-3">
                        <Label>First Name</Label>
                        <Input
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          invalid={touched.firstName && !!errors.firstName}
                        />
                        <FormFeedback>{errors.firstName}</FormFeedback>
                      </div>

                      {/* Last Name */}
                      <div className="mb-3">
                        <Label>Last Name</Label>
                        <Input
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          invalid={touched.lastName && !!errors.lastName}
                        />
                        <FormFeedback>{errors.lastName}</FormFeedback>
                      </div>
                    </Col>

                    <Col md={6}>
                      {/* Job Title */}
                      <div className="mb-3">
                        <Label>Job Title</Label>
                        <Input
                          name="jobTitle"
                          value={values.jobTitle}
                          onChange={handleChange}
                          invalid={touched.jobTitle && !!errors.jobTitle}
                        />
                        <FormFeedback>{errors.jobTitle}</FormFeedback>
                      </div>

                      {/* Permission */}
                      <div className="mb-3">
                        <Label>Permission</Label>
                        <Input
                          type="select"
                          name="permission"
                          value={values.permission}
                          onChange={handlePermissionChange}
                          invalid={touched.permission && !!errors.permission}
                        >
                          <option value="account">Account</option>
                          <option value="group">Group</option>
                          <option value="organization">Organization</option>
                        </Input>
                        <FormFeedback>{errors.permission}</FormFeedback>
                      </div>

                      {/* Entity (disabled input) */}
                      <div className="mb-3">
                        <Label>Entity</Label>
                        <Input
                          type="text"
                          name="entity"
                          value={values.entity}
                          disabled
                          invalid={touched.entity && !!errors.entity}
                        />
                        <FormFeedback>{errors.entity}</FormFeedback>
                      </div>

                      {/* Role */}
                      <div className="mb-3">
                        <Label>Role</Label>
                        <Input
                          type="select"
                          name="role"
                          value={values.role}
                          onChange={handleChange}
                          invalid={touched.role && !!errors.role}
                        >
                          <option value="owner">Owner</option>
                          <option value="viewer">Viewer</option>
                        </Input>
                        <FormFeedback>{errors.role}</FormFeedback>
                      </div>
                    </Col>
                  </Row>

                  <Col xs={12}>
                    <div className="text-end mt-3">
                      <Button color="primary" type="submit">
                        Add User
                      </Button>
                    </div>
                  </Col>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddUser;
