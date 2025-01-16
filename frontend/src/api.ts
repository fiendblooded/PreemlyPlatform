import axios from "axios";

const __dirname = window.location.origin;
const api = axios.create({
  baseURL: __dirname,
});

export default api;
