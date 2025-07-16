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

const Verify = (props) => {
  //meta title
  document.title = "Verify | Minia - React Admin & Dashboard Template";

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
      id: "",
      token: "",
    },

    onSubmit: async (values) => {
      try {
        const data = {
          id: values.id,
          token: values.token,
        };

        const res = await axios.post(
          "https://localhost:3443/api/users/verify-account",
          data
        );
        alert("Verification done:", res);
        navigate("/login");
      } catch (err) {
        alert("Login failed: " + err.message);
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
                        <h5 className="mb-0">Verify Account</h5>
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
                          <Label>ID</Label>
                          <Input
                            name="id"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.id}
                            invalid={
                              validation.touched.id &&
                              !!validation.errors.id
                            }
                          />
                          <FormFeedback>
                            {validation.errors.id}
                          </FormFeedback>
                        </div>

                        {/* User First Name */}
                        <div className="mb-3">
                          <Label>Token</Label>
                          <Input
                            name="token"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.token}
                            invalid={
                              validation.touched.token &&
                              !!validation.errors.token
                            }
                          />
                          <FormFeedback>
                            {validation.errors.token}
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
                            Verify Account
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

export default Verify;
