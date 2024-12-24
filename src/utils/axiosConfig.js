import axios from "axios";
import { API_VERSION, BASE_URL } from "./apiConfig";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/${API_VERSION}/`,
});

axiosInstance.interceptors.request.use((config) => {
  console.log("Request:", config);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
