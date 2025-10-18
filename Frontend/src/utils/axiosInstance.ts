import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.PUBLIC_BACKEND_URL,
});
