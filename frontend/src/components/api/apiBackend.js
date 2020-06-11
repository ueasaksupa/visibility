import axios from "axios";

export const SR_PCE_API = axios.create({
  baseURL: "http://a74da06766b9.ap.ngrok.io/pce",
  headers: {
    Authorization: "Basic YWRtaW46Q2lzY28xMjM=",
    Accept: "application/json",
  },
});

export const WAE_API = axios.create({
  baseURL: "http://a74da06766b9.ap.ngrok.io/wae",
  headers: {
    Authorization: "Basic YWRtaW46Q2lzY28xMjM=",
  },
});

export const NSO_API = axios.create({
  baseURL: "http://192.168.1.211:8888/nso",
  // baseURL: "http://a74da06766b9.ap.ngrok.io/nso",
  headers: {
    Authorization: "Basic YWRtaW46YWRtaW4=",
    "Content-Type": "application/yang-data+json",
    Accept: "application/yang-data+json",
  },
});
