import axios from "axios";

const CSCO_API_HOST = process.env.REACT_APP_CSCO_API_HOST || "0a6089024a34.ap.ngrok.io";

export const SR_PCE_API = axios.create({
  baseURL: `http://${CSCO_API_HOST}/pce`,
  headers: {
    Authorization: "Basic YWRtaW46Q2lzY28xMjM=",
    Accept: "application/json",
  },
});

export const WAE_API = axios.create({
  // baseURL: `http://${CSCO_API_HOST}/wae`,
  baseURL: `http://127.0.0.1:5001`,
  headers: {
    Authorization: "Basic YWRtaW46YWRtaW4=",
    "Content-Type": "application/yang-data+json",
    Accept: "application/yang-data+json",
  },
});

export const NSO_API = axios.create({
  baseURL: `http://127.0.0.1:8888/nso`,
  // baseURL: `http://${CSCO_API_HOST}/nso`,
  headers: {
    Authorization: "Basic YWRtaW46YWRtaW4=",
    "Content-Type": "application/yang-data+json",
    Accept: "application/yang-data+json",
  },
});
