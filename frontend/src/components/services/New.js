import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";

import { FormVPWS, FormELAN, FormL3VPNBGP, FormL3VPNSTATIC } from "./Form";
import { NSO_API } from "../api/apiBackend";
import BACKEND from "../api/pythonBackend";

const NavLinkList = (props) => {
  return props.dryrunResponse.map((ele, index) => {
    return (
      <Nav.Item key={index}>
        <Nav.Link eventKey={index}>{ele.name}</Nav.Link>
      </Nav.Item>
    );
  });
};

const NavLinkData = (props) => {
  return props.dryrunResponse.map((ele, index) => {
    return (
      <Tab.Pane key={index} eventKey={index}>
        <pre style={{ maxHeight: "500px", overflowY: "scroll" }}>{ele.data}</pre>
      </Tab.Pane>
    );
  });
};

const ServiceNew = (props) => {
  const [devices, setDevices] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedService, setSelectedService] = useState("L3VPNSTATIC");
  const [processingDryrun, setProcessingDryrun] = useState(false);
  const [isDeployComplete, setIsDeployComplete] = useState(false);
  const [dryrunResponse, setDryrunResponse] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const history = useHistory();

  const [inputParams, setInputParams] = useState({
    devices: [],
    scale: 1,
    "service-id": "TEST",
    "vlan-id": "1000",
    "evpn-evi": "1000",
    //
    labelPE: "1020",
    labelACC: "1020",
    "x-connect-group": "vpws-bg-bw",
    "p2p-domain": "eline-bg-bw",
    //
    "evpn-rt": "1111",
    "bridge-group": "elan-bg-bw",
    "bridge-domain": "elan",
    // L3VPN
    "pe-vlan": "1546",
    vrf: "L3_BGP_BG",
    rt: "100:1546",
    slice: "NPE-ACC-BW",
    // BGP
    neighbor: "1.1.1.1",
    neighbor1: "2.2.2.2",
    neighbor2: "3.3.3.3",
  });

  const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight);

  const payloadCreator = () => {
    const servicesParams = [];
    const payload = {};
    if (selectedService === "VPWS") {
      for (let i = 0; i < inputParams.scale; i++) {
        servicesParams.push({
          "service-id": `${inputParams["service-id"]}_${i}`,
          "common-param": {
            "vlan-id": parseInt(inputParams["vlan-id"]) + i,
            "evpn-evi": parseInt(inputParams["evpn-evi"]) + i,
            "x-connect-group": inputParams["x-connect-group"],
            "p2p-domain": inputParams["p2p-domain"],
          },
          "device-specific": {
            devices: inputParams.devices,
          },
        });
      }
      payload["vpws:vpws"] = servicesParams;
    } else if (selectedService === "ELAN") {
      for (let i = 0; i < inputParams.scale; i++) {
        servicesParams.push({
          "service-id": `${inputParams["service-id"]}_${i}`,
          "common-param": {
            "vlan-id": parseInt(inputParams["vlan-id"]) + i,
            "evpn-evi": parseInt(inputParams["evpn-evi"]) + i,
            "evpn-rt": inputParams["evpn-rt"],
            "bridge-domain": inputParams["bridge-domain"],
            "bridge-group": inputParams["bridge-group"],
          },
          "device-specific": {
            devices: inputParams.devices,
          },
        });
      }
      payload["elan:elan"] = servicesParams;
    } else if (selectedService === "L3VPNBGP") {
      let slice_container =
        inputParams["slice"].includes("BW") || inputParams["slice"].includes("LT") ? "NPE-ACC-BW-LT" : inputParams["slice"];
      for (let i = 0; i < inputParams.scale; i++) {
        servicesParams.push({
          "service-id": `${inputParams["service-id"]}_${i}`,
          "l3vpn-connected-type": inputParams["slice"],
          "common-param": {
            "pe-vlan": parseInt(inputParams["pe-vlan"]) + i,
            vrf: `${inputParams["vrf"]}_${parseInt(inputParams["pe-vlan"]) + i}`,
            rt: `100:${parseInt(inputParams["rt"].split(":")[1]) + i}`,
          },
          [slice_container]: {
            devices: inputParams.devices,
            "npe-router-bgp": {
              neighbor: inputParams["neighbor"],
              neighbor1: inputParams["neighbor1"],
            },
            "acc-router-bgp": {
              neighbor2: inputParams["neighbor2"],
            },
          },
        });
      }
      payload["L3VPNbgp:L3VPNbgp"] = servicesParams;
    } else if (selectedService === "L3VPNSTATIC") {
      let slice_container =
        inputParams["slice"].includes("BW") || inputParams["slice"].includes("LT") ? "NPE-ACC-BW-LT" : inputParams["slice"];
      for (let i = 0; i < inputParams.scale; i++) {
        let isSpecialSlice = inputParams["slice"].includes("SP");
        let payload = {
          "service-id": `${inputParams["service-id"]}_${i}`,
          "l3vpn-connected-type": inputParams["slice"],
          "common-param": {
            "pe-vlan": parseInt(inputParams["pe-vlan"]) + i,
            vrf: `${inputParams["vrf"]}_${parseInt(inputParams["pe-vlan"]) + i}`,
            rt: `100:${parseInt(inputParams["rt"].split(":")[1]) + i}`,
          },
          [slice_container]: {
            devices: inputParams.devices,
            "npe-router-static": {
              "destination-ip": inputParams["destination-ip"],
              interface: inputParams["interface"],
              "forward-ip": inputParams["forward-ip"],
              interface1: inputParams["interface1"],
              "forward-ip1": inputParams["forward-ip1"],
            },
            "acc-router-static": {
              "destination-ip2": inputParams["destination-ip2"],
              interface2: inputParams["interface2"],
              "forward-ip2": inputParams["forward-ip2"],
            },
          },
        };
        if (isSpecialSlice) {
          payload[slice_container].BVI = {
            "bvi-interface": inputParams["bvi-interface"],
            "bvi-ipv4-address": inputParams["bvi-ipv4-address"],
            "bvi-mac-address": inputParams["bvi-mac-address"],
          };
          payload[slice_container].evpn = {
            evi: inputParams["evi"],
            "route-target": inputParams["route-target"],
          };
        }
        servicesParams.push(payload);
      }
      payload["L3VPNstatic:L3VPNstatic"] = servicesParams;
    }
    return payload;
  };

  const serviceDryRunHandler = async (e) => {
    e.preventDefault();
    setProcessingDryrun(true);
    setDryrunResponse(null);

    let data = payloadCreator();
    console.log("payload: ", data);
    try {
      let response = await NSO_API.post("restconf/data?dry-run=native", data);
      if (response.status === 201) {
        setDryrunResponse(response.data["dry-run-result"].native.device);
        scrollToBottom();
        console.log("response dryrun: ", response);
      }
    } catch (error) {
      console.log("err dryrun: ", error.response);
      setErrMsg(error.response.data.errors.error[0]["error-message"]);
    }
    setProcessingDryrun(false);
  };

  const serviceCreateHandler = async (e) => {
    e.preventDefault();
    setModalShow(true);
    let data;
    if (selectedService === "VPWS") {
      data = {
        payload: payloadCreator(),
        status: "active",
        type: selectedService.toLowerCase(),
        scale: inputParams.scale,
        name: inputParams["service-id"],
        st_vlan: inputParams["vlan-id"],
        st_evi: inputParams["evpn-evi"],
        labelACC: inputParams.labelACC,
        labelPE: inputParams.labelPE,
        group: inputParams["x-connect-group"],
        domain: inputParams["p2p-domain"],
        devices: inputParams.devices,
      };
    } else if (selectedService === "ELAN") {
      data = {
        payload: payloadCreator(),
        status: "active",
        type: selectedService.toLowerCase(),
        scale: inputParams.scale,
        name: inputParams["service-id"],
        st_vlan: inputParams["vlan-id"],
        st_evi: inputParams["evpn-evi"],
        rt: inputParams["evpn-rt"],
        group: inputParams["bridge-group"],
        domain: inputParams["bridge-domain"],
        devices: inputParams.devices,
      };
    } else if (selectedService === "L3VPNBGP") {
      data = {
        payload: payloadCreator(),
        status: "active",
        type: selectedService.toLowerCase(),
        scale: inputParams.scale,
        name: inputParams["service-id"],
        st_vlan: inputParams["vlan-id"],
        rt: inputParams["rt"],
        vrf: inputParams["vrf"],
        devices: inputParams.devices,
      };
    } else if (selectedService === "L3VPNSTATIC") {
      data = {
        payload: payloadCreator(),
        status: "active",
        type: selectedService.toLowerCase(),
        scale: inputParams.scale,
        name: inputParams["service-id"],
        st_vlan: inputParams["vlan-id"],
        rt: inputParams["rt"],
        vrf: inputParams["vrf"],
        devices: inputParams.devices,
      };
    }
    let responseBACKEND = await BACKEND.post(`/services/${selectedService.toLowerCase()}`, data);
    if (responseBACKEND.status === 200) {
      // Successfully save service to DB
      // go ahead create on NSO
      try {
        let responseNSO = await NSO_API.post("restconf/data", data.payload);
        if (responseNSO.status === 201) {
          // Successfully create on NSO
          setIsDeployComplete(true);
          console.log("response nso: ", responseNSO);
        }
      } catch (error) {
        console.log("err deploy: ", error.response);
        setModalShow(false);
        setIsDeployComplete(false);
        setErrMsg(error.response.data.errors.error[0]["error-message"]);
      }
    }
  };

  const onDeviceAddHandler = (object, action = "add") => {
    if (action === "add") {
      setInputParams({
        ...inputParams,
        devices: [...inputParams.devices, object],
      });
    } else if (action === "delete") {
      let tmp = inputParams.devices;
      console.log(object);
      tmp.splice(object, 1);
      setInputParams({
        ...inputParams,
        devices: [...tmp],
      });
    }
  };

  const onInputChangeHandler = (event) => {
    const type = event.target.type;
    const id = event.target.id;
    const value = event.target.value;
    setInputParams({
      ...inputParams,
      [id]: type === "checkbox" ? event.target.checked : value,
    });
  };

  const onServiceChangeHandler = (event) => {
    const target = event.target.value;
    setSelectedService(target);
  };

  const fetchAllDevices = async () => {
    const response = await NSO_API.get("restconf/data/tailf-ncs:devices/device-group");
    console.log("devices: ", response.data["tailf-ncs:device-group"]);
    setDevices(response.data["tailf-ncs:device-group"][0].member);
  };

  useEffect(() => {
    fetchAllDevices();
  }, []);

  const showForm = {
    VPWS: (
      <FormVPWS onChange={onInputChangeHandler} inputParams={inputParams} onDeviceAdd={onDeviceAddHandler} devices={devices} />
    ),
    ELAN: (
      <FormELAN onChange={onInputChangeHandler} inputParams={inputParams} onDeviceAdd={onDeviceAddHandler} devices={devices} />
    ),
    L3VPNBGP: (
      <FormL3VPNBGP
        onChange={onInputChangeHandler}
        inputParams={inputParams}
        onDeviceAdd={onDeviceAddHandler}
        devices={devices}
      />
    ),
    L3VPNSTATIC: (
      <FormL3VPNSTATIC
        onChange={onInputChangeHandler}
        inputParams={inputParams}
        onDeviceAdd={onDeviceAddHandler}
        devices={devices}
      />
    ),
  };
  const dryrunSection = (
    <div className="card my-3">
      <div className="card-header">
        <div className="row">
          <div className="col-md-6">Dry-run result</div>
        </div>
      </div>
      <Tab.Container id="left-tabs-example" defaultActiveKey="0">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <NavLinkList dryrunResponse={dryrunResponse} />
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content className="my-3">
              <NavLinkData dryrunResponse={dryrunResponse} />
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      <div className="card-footer text-right">
        <button className="bg-blue btn btn-primary btn-sm" onClick={serviceCreateHandler}>
          Confirm to deploy
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="container-fluid mt-3">
        {errMsg ? (
          <Alert variant="danger" onClose={() => setErrMsg(null)} dismissible>
            <Alert.Heading>You got an error!</Alert.Heading>
            <p>{errMsg}</p>
          </Alert>
        ) : null}
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-6">Create New Service</div>
            </div>
          </div>
          <Form onSubmit={(e) => serviceDryRunHandler(e)}>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <div className="container-fluid">
                    <Form.Row>
                      <Form.Group as={Col} md="3" sm="3" controlId="service">
                        <Form.Label>Service</Form.Label>
                        <Form.Control as="select" value={selectedService} onChange={onServiceChangeHandler}>
                          <option value="VPWS">VPWS</option>
                          <option value="ELAN">ELAN</option>
                          <option value="L3VPNBGP">L3VPN BGP</option>
                          <option value="L3VPNSTATIC">L3VPN Static</option>
                          <option value="L3VPNCONNTECTED">L3VPN Connected</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group as={Col} md="2" sm="3" controlId="scale">
                        <Form.Label>Scale factor</Form.Label>
                        <Form.Control required type="number" value={inputParams.scale} onChange={onInputChangeHandler} />
                      </Form.Group>
                    </Form.Row>
                    {showForm[selectedService]}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer text-right">
              {processingDryrun ? (
                <div className="text-center">
                  Calculating...{"   "}
                  <Spinner animation="border" size="sm" variant="dark" />
                </div>
              ) : (
                <button className="bg-blue btn btn-primary btn-sm" type="submit">
                  Next
                </button>
              )}
            </div>
          </Form>
        </div>
        {dryrunResponse ? dryrunSection : null}
      </div>
      {/* MODAL */}
      <Modal show={modalShow} backdrop="static">
        <Modal.Body>
          {isDeployComplete ? (
            "Provision Completed"
          ) : (
            <div>
              Deploying...{"   "}
              <Spinner animation="border" size="sm" variant="dark" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="bg-blue btn btn-primary btn-sm" onClick={() => history.push("/service")}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ServiceNew;
