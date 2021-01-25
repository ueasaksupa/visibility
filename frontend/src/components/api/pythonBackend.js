import axios from "axios";

const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST || "127.0.0.1";
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || "5000";

export default axios.create({
  baseURL: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
});
