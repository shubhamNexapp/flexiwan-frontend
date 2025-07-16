// src/api.js
import axios from "axios";

const API_BASE_URL = "https://manage.flexiwan.com/api";

// Get token from localStorage (or change to your source)
// const getToken = () => localStorage.getItem("authToken");

// Axios instance with base config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODc0YjNkMWQ3MTJhNTY0ZjYwODE4MDMiLCJ1c2VybmFtZSI6InBhdGlsYWtzaGF5NzM4N0BnbWFpbC5jb20iLCJvcmciOiI2ODc2NGI3NGQ3MTJhNTY0ZjYzMDY1OTMiLCJvcmdOYW1lIjoiVGVzdDIiLCJhY2NvdW50IjoiNjg3NGIzZDFkNzEyYTU2NGY2MDgxODAxIiwiYWNjb3VudE5hbWUiOiJOYW5vIiwicGVybXMiOnsiam9icyI6MTUsImJpbGxpbmciOjMsImFjY291bnRzIjo3LCJvcmdhbml6YXRpb25zIjoxNSwiZGV2aWNlcyI6MTUsInRva2VucyI6MTUsImFwcGlkZW50aWZpY2F0aW9ucyI6MTUsIm1lbWJlcnMiOjE1LCJ0dW5uZWxzIjoxNSwicGVlcnMiOjE1LCJhY2Nlc3N0b2tlbnMiOjE1LCJub3RpZmljYXRpb25zIjoxNSwibm90aWZpY2F0aW9uc0NvbmYiOjAsInBhdGhsYWJlbHMiOjE1LCJtbHBvbGljaWVzIjoxNSwiYXBwbGljYXRpb25zIjoxNSwicW9zcG9saWNpZXMiOjE1LCJmaXJld2FsbHBvbGljaWVzIjoxNSwidnJycCI6MTUsImFpIjoxNSwibGlua21vbml0b3JzIjoxNX0sIm1mYVZlcmlmaWVkIjpmYWxzZSwiaWF0IjoxNzUyNjYxMzkzLCJleHAiOjE3NTI2NjE2OTN9.ExlwBJfJc7Dx3hq1hyVw021stBJWOyEatk3X-grRTOQ"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ GET request with optional query params
export const getData = async (endpoint, params = {}) => {
  try {
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error("GET Error:", error);
    throw error;
  }
};

// ✅ POST request with body
export const postData = async (endpoint, body) => {
  try {
    const response = await axiosInstance.post(endpoint, body);
    return response.data
  } catch (error) {
    console.error("POST Error:", error);
    throw error;
  }
};

// ✅ PUT request with body
export const putData = async (endpoint, body) => {
  try {
    const response = await axiosInstance.put(endpoint, body);
    return response.data;
  } catch (error) {
    console.error("PUT Error:", error);
    throw error;
  }
};

// ✅ DELETE request with optional id or params
export const deleteData = async (endpoint) => {
  try {
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error("DELETE Error:", error);
    throw error;
  }
};


// {
//     "username": "shubham@gmail.com",
//     "password": "Shubham@123"
// }

//  <CardHeader className="d-flex justify-content-between align-items-center">
//                 <h4 className="mb-0">Organizations</h4>
//                 <Link to="/add-organizations">
//                   <button className="btn btn-outline-primary">
//                     Add <i className="mdi mdi-plus-circle ms-1"></i>
//                   </button>
//                 </Link>
//               </CardHeader>