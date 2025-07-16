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
import { useNavigate } from "react-router-dom";
import { getData, putData } from "../../helpers/api";
import axios from "axios";

// Validation Schema
const validationSchema = Yup.object().shape({
  companyName: Yup.string().required("Company Name is required"),
  country: Yup.string().required("Country is required"),
});

const AccountProfile = () => {
  const accountId = "6874b3d1d712a564f6081801";
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      companyName: "",
      country: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.companyName,
          country: values.country,
        };

        await putData(`/accounts/${accountId}`, payload);
        toast.success("Account updated successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update account.");
      }
    },
  });
  const [countries, setCountries] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchAccount = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching account data:", error);
        toast.error("Failed to fetch account data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  console.log("countries=====", countries);
  console.log("formik values=====", formik.values);

  const { values, handleChange, handleSubmit, errors, touched } = formik;

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Forms" breadcrumbItem="Edit Account" />
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <h4>Edit Account</h4>
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
