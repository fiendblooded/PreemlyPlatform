import axios from "axios";

const __dirname = window.location.origin;
const api = axios.create({
  baseURL: __dirname, // Backend URL
});

export default api;
