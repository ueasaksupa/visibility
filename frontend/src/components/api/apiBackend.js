import axios from "axios";

export const SR_PCE_API = axios.create({
  baseURL: "http://0a6089024a34.ap.ngrok.io/pce",
  headers: {
    Authorization: "Basic YWRtaW46Q2lzY28xMjM=",
    Accept: "application/json",
  },
});

export const WAE_API = axios.create({
  baseURL: "http://0a6089024a34.ap.ngrok.io/wae",
  headers: {
    Authorization: "Basic YWRtaW46YWRtaW4=",
    "Content-Type": "application/yang-data+json",
    Accept: "application/yang-data+json",
  },
});

export const NSO_API = axios.create({
  baseURL: "http://127.0.0.1:8888/nso",
  // baseURL: "http://0a6089024a34.ap.ngrok.io/nso",
  headers: {
    Authorization: "Basic YWRtaW46YWRtaW4=",
    "Content-Type": "application/yang-data+json",
    Accept: "application/yang-data+json",
  },
});
