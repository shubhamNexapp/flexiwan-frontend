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
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { getData, putData } from "../../helpers/api";
import axios from "axios";
import { LoaderHide, LoaderShow } from "../../helpers/common.constants";
import loader from "../../assets/images/instaone-loader.svg";

// Validation Schema
const validationSchema = Yup.object().shape({
  companyName: Yup.string().required("Company Name is required"),
  country: Yup.string().required("Country is required"),
});

const AccountProfile = () => {
  const accountId = "6874b3d1d712a564f6081801";

  const formik = useFormik({
    initialValues: {
      companyName: "",
      country: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        LoaderShow()
        const payload = {
          name: values.companyName,
          country: values.country,
        };
        await putData(`/accounts/${accountId}`, payload);
        toast.success("Account updated successfully!");
        LoaderHide()
      } catch (error) {
        LoaderHide()
        toast.error("Failed to update account.");
      }
      LoaderHide()
    },
  });
  const [countries, setCountries] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        LoaderShow()
        const fetchCountryData = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );
        const sorted = fetchCountryData?.data
          .map((c) => ({ code: c.cca2, name: c.name.common }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);

        const response = await getData(`/accounts/${accountId}`);
        console.log("Fetched Account Data:", response);

        formik.setValues({
          companyName: response.name || "",
          country: response.country || "", // ✅ Corrected here
        });
        LoaderHide()
      } catch (error) {
        LoaderHide()
        console.error("Error fetching account data:", error);
      } finally {
        LoaderHide()
      }
    };

    fetchAccount();
  }, []);

  const { values, handleChange, handleSubmit, errors, touched } = formik;

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
        <Breadcrumbs title="Forms" breadcrumbItem="Account Profile" />
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Account Profile</h4>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      {/* Company Name */}
                      <div className="mb-3">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={values.companyName}
                          onChange={handleChange}
                          invalid={touched.companyName && !!errors.companyName}
                        />
                        <FormFeedback>{errors.companyName}</FormFeedback>
                      </div>
                    </Col>

                    <Col md={6}>
                      {/* Country */}
                      <div className="mb-3">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          type="select"
                          value={formik.values.country}
                          onChange={handleChange}
                          invalid={touched.country && !!errors.country}
                        >
                          <option value="">-- Select Country --</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </Input>
                        <FormFeedback>{errors.country}</FormFeedback>
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

export default AccountProfile;
