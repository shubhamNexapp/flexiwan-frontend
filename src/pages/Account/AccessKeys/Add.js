import React, { useEffect, useState } from "react";
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
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { postData, getData } from "../../../helpers/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LoaderHide, LoaderShow } from "../../../helpers/common.constants";
import loader from "../../../assets/images/instaone-loader.svg";

const permissionApis = {
  account: "/members/options/account",
  group: "/members/options/group",
  organization: "/members/options/organization",
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  permission: Yup.string()
    .oneOf(["account", "group", "organization"])
    .required("Permission is required"),
  entity: Yup.string().required("Entity is required"),
  role: Yup.string().oneOf(["owner", "viewer"]).required("Role is required"),
});

const AddTokens = () => {
  const navigate = useNavigate();
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [entityOptions, setEntityOptions] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      permission: "account",
      entity: "",
      role: "owner",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        LoaderShow();
        const data = {
          name: values.name,
          accessKeyPermissionTo: values.permission,
          accessKeyEntity: values.entity,
          accessKeyRole: values.role,
          validityEntity: "Default",
        };

        await postData("/accesstokens", data);
        LoaderHide();
        toast.success("Token added successfully!");
        navigate("/accesskeys");
      } catch (err) {
        LoaderHide();
        console.error(err);
        toast.error("Failed to add token.");
      }
    },
  });

  const { values, handleChange, handleSubmit, errors, touched, setFieldValue } =
    formik;

  useEffect(() => {
    fetchAndSetEntity(values.permission);
  }, []);

  const fetchAndSetEntity = async (permission) => {
    setLoadingTargets(true);
    try {
      LoaderShow();
      const response = await getData(permissionApis[permission]);
      LoaderHide();

      setEntityOptions(response || []);
      const defaultEntityId = response?.[0]?.id || "";
      setFieldValue("entity", defaultEntityId);
    } catch (err) {
      console.error("Error fetching entity:", err);
      toast.error("Failed to load entity.");
      setEntityOptions([]);
      setFieldValue("entity", "");
    } finally {
      LoaderHide();
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
        <img
          src={loader}
          alt="loader-img"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <Container fluid>
        <Breadcrumbs title="Forms" breadcrumbItem="Add Access key" />
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <h4 className="card-title">Add Access key</h4>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      {/* Job Title */}
                      <div className="mb-3">
                        <Label>Name</Label>
                        <Input
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          invalid={touched.name && !!errors.name}
                        />
                        <FormFeedback>{errors.name}</FormFeedback>
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
                        <FormFeedback>{errors.name}</FormFeedback>
                      </div>

                      {/* Entity (disabled input) */}
                      <div className="mb-3">
                        <Label>Entity</Label>
                        <Input
                          type="select"
                          name="entity"
                          value={values.entity}
                          onChange={handleChange}
                          invalid={touched.entity && !!errors.entity}
                        >
                          <option value="">Select Entity</option>
                          {entityOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.value}
                            </option>
                          ))}
                        </Input>
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
                        Add
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

export default AddTokens;
