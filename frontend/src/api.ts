import axios from "axios";
import path from "path";
const __dirname = path.resolve();
const api = axios.create({
  baseURL: __dirname, // Backend URL
});

export default api;
