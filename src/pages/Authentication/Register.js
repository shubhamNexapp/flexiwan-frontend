import React, { useEffect } from "react";
import {
  Row,
  Col,
  Alert,
  Container,
  Input,
  Label,
  Form,
  FormFeedback,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { registerUser, apiError } from "../../store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link } from "react-router-dom";

// import images
import logo from "../../assets/images/logo-sm.svg";
import CarouselPage from "../AuthenticationInner/CarouselPage";
import { createSelector } from "reselect";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Register = (props) => {
  //meta title
  document.title = "Register | Minia - React Admin & Dashboard Template";

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const registerData = createSelector(
    (state) => state.Account,
    (state) => ({
      user: state.user,
      registrationError: state.registrationError,
      loading: state.loading,
    })
  );
  // Inside your component
  const { user, registrationError } = useSelector(registerData);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      accountName: "",
      userFirstName: "",
      userLastName: "",
      email: "",
      password: "",
      userJobTitle: "",
      userPhoneNumber: "",
      country: "US",
      companySize: "0-10",
      serviceType: "Provider",
      numberSites: "10",
      companyType: "",
      companyDesc: "",
      captcha: "",
    },

    validationSchema: Yup.object({
      accountName: Yup.string().required("Please enter your Account Name"),
      userFirstName: Yup.string().required("Please enter your First Name"),
      userLastName: Yup.string().required("Please enter your Last Name"),
      email: Yup.string().email().required("Please enter a valid Email"),
      password: Yup.string().required("Please enter your Password"),
      userJobTitle: Yup.string().required("Please enter your Job Title"),
      userPhoneNumber: Yup.string().required("Please enter your Phone Number"),
      country: Yup.string().required("Please select Country"),
      companySize: Yup.string().required("Please select Company Size"),
      serviceType: Yup.string().required("Please select Service Type"),
      numberSites: Yup.string().required("Please enter number of sites"),
      companyType: Yup.string().required("Please enter Company Type"),
      companyDesc: Yup.string().required("Please enter Company Description"),
      captcha: Yup.string().required("Captcha is required"),
    }),

    onSubmit: async (values) => {
      try {
        await axios.post("https://localhost:3443/api/users/register", values);
        alert("Registration successful. Redirecting to verification page.");
        navigate("/page-verify");
      } catch (error) {
        alert(
          "Registration failed: " +
            (error?.response?.data?.message || error.message)
        );
      }
    },
  });

  useEffect(() => {
    dispatch(apiError(""));
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="auth-page">
        <Container fluid className="p-0">
          <Row className="g-0">
            <Col lg={4} md={5} className="col-xxl-3">
              <div className="auth-full-page-content d-flex p-sm-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 mb-md-5 text-center">
                      <Link to="/dashboard" className="d-block auth-logo">
                        <img src={logo} alt="" height="28" />{" "}
                        <span className="logo-txt">Minia</span>
                      </Link>
                    </div>
                    <div className="auth-content my-auto">
                      <div className="text-center">
                        <h5 className="mb-0">Register Account</h5>
                        <p className="text-muted mt-2">
                          Get your free Minia account now.
                        </p>
                      </div>

                      <Form
                        className="needs-validation custom-form mt-4 pt-2"
                        onSubmit={validation.handleSubmit}
                      >
                        {user && user ? (
                          <Alert color="success">
                            Register User Successfully
                          </Alert>
                        ) : null}

                        {registrationError && registrationError ? (
                          <Alert color="danger">{registrationError}</Alert>
                        ) : null}

                        {/* Account Name */}
                        <div className="mb-3">
                          <Label>Account Name</Label>
                          <Input
                            name="accountName"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.accountName}
                            invalid={
                              validation.touched.accountName &&
                              !!validation.errors.accountName
                            }
                          />
                          <FormFeedback>
                            {validation.errors.accountName}
                          </FormFeedback>
                        </div>

                        {/* User First Name */}
                        <div className="mb-3">
                          <Label>First Name</Label>
                          <Input
                            name="userFirstName"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.userFirstName}
                            invalid={
                              validation.touched.userFirstName &&
                              !!validation.errors.userFirstName
                            }
                          />
                          <FormFeedback>
                            {validation.errors.userFirstName}
                          </FormFeedback>
                        </div>

                        {/* User Last Name */}
                        <div className="mb-3">
                          <Label>Last Name</Label>
                          <Input
                            name="userLastName"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.userLastName}
                            invalid={
                              validation.touched.userLastName &&
                              !!validation.errors.userLastName
                            }
                          />
                          <FormFeedback>
                            {validation.errors.userLastName}
                          </FormFeedback>
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                          <Label>Email</Label>
                          <Input
                            name="email"
                            type="email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email}
                            invalid={
                              validation.touched.email &&
                              !!validation.errors.email
                            }
                          />
                          <FormFeedback>{validation.errors.email}</FormFeedback>
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                          <Label>Password</Label>
                          <Input
                            name="password"
                            type="password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.password}
                            invalid={
                              validation.touched.password &&
                              !!validation.errors.password
                            }
                          />
                          <FormFeedback>
                            {validation.errors.password}
                          </FormFeedback>
                        </div>

                        {/* Job Title */}
                        <div className="mb-3">
                          <Label>Job Title</Label>
                          <Input
                            name="userJobTitle"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.userJobTitle}
                            invalid={
                              validation.touched.userJobTitle &&
                              !!validation.errors.userJobTitle
                            }
                          />
                          <FormFeedback>
                            {validation.errors.userJobTitle}
                          </FormFeedback>
                        </div>

                        {/* Phone Number */}
                        <div className="mb-3">
                          <Label>Phone Number</Label>
                          <Input
                            name="userPhoneNumber"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.userPhoneNumber}
                            invalid={
                              validation.touched.userPhoneNumber &&
                              !!validation.errors.userPhoneNumber
                            }
                          />
                          <FormFeedback>
                            {validation.errors.userPhoneNumber}
                          </FormFeedback>
                        </div>

                        {/* Country */}
                        <div className="mb-3">
                          <Label>Country</Label>
                          <Input
                            name="country"
                            type="select"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.country}
                            invalid={
                              validation.touched.country &&
                              !!validation.errors.country
                            }
                          >
                            <option value="US">United States</option>
                            <option value="IN">India</option>
                            <option value="UK">United Kingdom</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.country}
                          </FormFeedback>
                        </div>

                        {/* Company Size */}
                        <div className="mb-3">
                          <Label>Company Size</Label>
                          <Input
                            name="companySize"
                            type="select"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.companySize}
                            invalid={
                              validation.touched.companySize &&
                              !!validation.errors.companySize
                            }
                          >
                            <option value="0-10">0-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="200+">200+</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.companySize}
                          </FormFeedback>
                        </div>

                        {/* Service Type */}
                        <div className="mb-3">
                          <Label>Service Type</Label>
                          <Input
                            name="serviceType"
                            type="select"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.serviceType}
                            invalid={
                              validation.touched.serviceType &&
                              !!validation.errors.serviceType
                            }
                          >
                            <option value="Provider">Provider</option>
                            <option value="Consumer">Consumer</option>
                          </Input>
                          <FormFeedback>
                            {validation.errors.serviceType}
                          </FormFeedback>
                        </div>

                        {/* Number of Sites */}
                        <div className="mb-3">
                          <Label>Number of Sites</Label>
                          <Input
                            name="numberSites"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.numberSites}
                            invalid={
                              validation.touched.numberSites &&
                              !!validation.errors.numberSites
                            }
                          />
                          <FormFeedback>
                            {validation.errors.numberSites}
                          </FormFeedback>
                        </div>

                        {/* Company Type */}
                        <div className="mb-3">
                          <Label>Company Type</Label>
                          <Input
                            name="companyType"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.companyType}
                            invalid={
                              validation.touched.companyType &&
                              !!validation.errors.companyType
                            }
                          />
                          <FormFeedback>
                            {validation.errors.companyType}
                          </FormFeedback>
                        </div>

                        {/* Company Description */}
                        <div className="mb-3">
                          <Label>Company Description</Label>
                          <Input
                            name="companyDesc"
                            type="textarea"
                            rows="3"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.companyDesc}
                            invalid={
                              validation.touched.companyDesc &&
                              !!validation.errors.companyDesc
                            }
                          />
                          <FormFeedback>
                            {validation.errors.companyDesc}
                          </FormFeedback>
                        </div>

                        {/* Captcha */}
                        <div className="mb-3">
                          <Label>Captcha</Label>
                          <Input
                            name="captcha"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.captcha}
                            invalid={
                              validation.touched.captcha &&
                              !!validation.errors.captcha
                            }
                          />
                          <FormFeedback>
                            {validation.errors.captcha}
                          </FormFeedback>
                        </div>

                        <div className="mb-4">
                          <p className="mb-0">
                            By registering you agree to the Minia{" "}
                            <Link to="#" className="text-primary">
                              Terms of Use
                            </Link>
                          </p>
                        </div>
                        <div className="mb-3">
                          <button
                            className="btn btn-primary w-100 waves-effect waves-light"
                            type="submit"
                          >
                            Register
                          </button>
                        </div>
                      </Form>

                      <div className="mt-5 text-center">
                        <p className="text-muted mb-0">
                          Already have an account ?{" "}
                          <Link
                            to="/login"
                            className="text-primary fw-semibold"
                          >
                            {" "}
                            Login{" "}
                          </Link>{" "}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                        © {new Date().getFullYear()} Minia . Crafted with{" "}
                        <i className="mdi mdi-heart text-danger"></i> by
                        Themesbrand
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <CarouselPage />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Register;
