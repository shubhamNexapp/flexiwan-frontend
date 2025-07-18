import React, { useEffect, useState } from "react";
import {
    Card, CardBody, CardHeader, Col, Container,
    Row, Label, Input, Button, FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getData, putData } from "../../helpers/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const permissionApis = {
    account: "/members/options/account",
    group: "/members/options/group",
    organization: "/members/options/organization",
};

const validationSchema = Yup.object().shape({
    permission: Yup.string()
        .oneOf(["account", "group", "organization"])
        .required("Permission is required"),
    entity: Yup.string().required("Entity is required"),
    role: Yup.string().oneOf(["owner", "viewer"]).required("Role is required"),
});

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState([])

    const formik = useFormik({
        initialValues: {
            permission: "account",
            entity: "",
            role: "owner",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const payload = {
                    userEntity: values.entity,
                    userPermissionTo: values.permission,
                    userRole: values.role,
                    userId: userData[0].user__id,
                    _id: userData[0]._id
                };
                await putData(`/members/${id}`, payload);
                toast.success("User updated successfully!");
                navigate("/users");
            } catch (err) {
                console.error(err);
                toast.error("Failed to update user.");
            }
        },
    });

    const {
        values,
        handleChange,
        handleSubmit,
        setFieldValue,
        errors,
        touched,
    } = formik;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getData(`/members/${id}`);
                setUserData(user)
                setFieldValue("permission", userData.to || "account");
                setFieldValue("role", userData.role || "owner");
                setFieldValue("entity", userData.entity || "owner");

                // Set entity based on existing data:
                const ent = user.group || user.organization_name || user.account_name;
                setFieldValue("entity", ent);

            } catch (err) {
                console.error("Failed to fetch user", err);
                toast.error("Failed to load user details.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, setFieldValue]);

    useEffect(() => {
        fetchAndSetEntity(values.permission);
    }, []);

    const fetchAndSetEntity = async (permission) => {
        try {
            const response = await getData(permissionApis[permission]);
            const entityName = response?.[0]?.value || "";
            setFieldValue("entity", entityName); // Set entity inside formik
        } catch (err) {
            console.error("Error fetching entity:", err);
            toast.error("Failed to load entity.");
            setFieldValue("entity", "");
        } finally {
        }
    };

    console.log("userData==========", userData)


    const updateEntity = async (permission) => {
        try {
            const resp = await getData(permissionApis[permission]);
            const val = resp[0]?.value || "";
            setFieldValue("entity", val);
        } catch {
            setFieldValue("entity", "");
        }
    };

    const handlePermissionChange = async (e) => {
        const perm = e.target.value;
        setFieldValue("permission", perm);
        await updateEntity(perm);
    };

    if (loading) return <div className="p-4">Loading user...</div>;

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Forms" breadcrumbItem="Edit User" />
                <Row>
                    <Col xs={12}>
                        <Card>
                            <CardHeader>
                                <h4 className="card-title">Edit User</h4>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Label className="mt-3">Permission</Label>
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

                                            <Label className="mt-3">Entity</Label>
                                            <Input
                                                type="text"
                                                name="entity"
                                                value={values.entity}
                                                disabled
                                                invalid={touched.entity && !!errors.entity}
                                            />
                                            <FormFeedback>{errors.entity}</FormFeedback>

                                            <Label className="mt-3">Role</Label>
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
                                        </Col>
                                    </Row>
                                    <div className="text-end mt-3">
                                        <Button color="primary" type="submit">
                                            Update User
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EditUser;
