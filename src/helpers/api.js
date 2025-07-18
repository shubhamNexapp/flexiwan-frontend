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
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODc0YjNkMWQ3MTJhNTY0ZjYwODE4MDMiLCJ0eXBlIjoiYXBwX2FjY2Vzc19rZXkiLCJhY2NvdW50IjoiNjg3NGIzZDFkNzEyYTU2NGY2MDgxODAxIiwiaWQiOiI2ODc4ZjdiNzAwODIzMjMxZmQ2M2JmYjMiLCJpYXQiOjE3NTI3NTgxOTl9.wAGOsyLQqMLwL1psc9shlJmGk2DQTafeZE_LQ_YOf5I"
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