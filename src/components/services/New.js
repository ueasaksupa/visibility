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

const FormVPWS = (props) => {
  let deviceOption = [<option key="0">-</option>];
  const [intfNumberSelector1, setIntfNumberSelector1] = useState(null);
  const [intfNumberSelector2, setIntfNumberSelector2] = useState(null);
  const [intfNumberSelector3, setIntfNumberSelector3] = useState(null);

  deviceOption = [
    ...deviceOption,
    props.devices.map((deviceName, index) => {
      return <option key={index + 1}>{deviceName}</option>;
    }),
  ];

  const fetchInterfaceId = () => {
    if (props.inputParams.node1 && props.inputParams.intfTypeNode1) {
      NSO_API.get(
        `restconf/data/tailf-ncs:devices/device=${props.inputParams.node1}/config/tailf-ned-cisco-ios-xr:interface/${props.inputParams.intfTypeNode1}`,
      ).then((response) => {
        console.log("1: ", response);
        if (response.status === 200) {
          setIntfNumberSelector1([
            <option key="0">-</option>,
            ...response.data[`tailf-ned-cisco-ios-xr:${props.inputParams.intfTypeNode1}`].map((ele, index) => {
              return <option key={index + 1}>{ele.id}</option>;
            }),
          ]);
        } else {
          setIntfNumberSelector1(null);
        }
      });
    }
    if (props.inputParams.node2 && props.inputParams.intfTypeNode2) {
      NSO_API.get(
        `restconf/data/tailf-ncs:devices/device=${props.inputParams.node2}/config/tailf-ned-cisco-ios-xr:interface/${props.inputParams.intfTypeNode2}`,
      ).then((response) => {
        console.log("2: ", response);
        if (response.status === 200) {
          setIntfNumberSelector2([
            <option key="0">-</option>,
            ...response.data[`tailf-ned-cisco-ios-xr:${props.inputParams.intfTypeNode2}`].map((ele, index) => {
              return <option key={index + 1}>{ele.id}</option>;
            }),
          ]);
        } else {
          setIntfNumberSelector2(null);
        }
      });
    }
    if (props.inputParams.node3 && props.inputParams.intfTypeNode3) {
      NSO_API.get(
        `restconf/data/tailf-ncs:devices/device=${props.inputParams.node3}/config/tailf-ned-cisco-ios-xr:interface/${props.inputParams.intfTypeNode3}`,
      ).then((response) => {
        console.log("3: ", response);
        if (response.status === 200) {
          setIntfNumberSelector3([
            <option key="0">-</option>,
            ...response.data[`tailf-ned-cisco-ios-xr:${props.inputParams.intfTypeNode3}`].map((ele, index) => {
              return <option key={index + 1}>{ele.id}</option>;
            }),
          ]);
        } else {
          setIntfNumberSelector3(null);
        }
      });
    }
  };

  useEffect(() => {
    fetchInterfaceId();
  }, [
    props.inputParams.node1 + props.inputParams.intfTypeNode1,
    props.inputParams.node2 + props.inputParams.intfTypeNode2,
    props.inputParams.node3 + props.inputParams.intfTypeNode3,
  ]);

  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId="service-id">
          <Form.Label>Service name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="eline service"
            onChange={props.onChange}
            value={props.inputParams["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="vlan-id">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Start vlan number"
            onChange={props.onChange}
            value={props.inputParams["vlan-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="evpn-evi">
          <Form.Label>Start EVI Number</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Start EVI number"
            onChange={props.onChange}
            value={props.inputParams["evpn-evi"]}
          />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="labelPE">
          <Form.Label>Label PE</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.labelPE} />
        </Form.Group>
        <Form.Group as={Col} controlId="labelACC">
          <Form.Label>Label ACC</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.labelACC} />
        </Form.Group>
        <Form.Group as={Col} controlId="x-connect-group">
          <Form.Label>x-connect-group</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["x-connect-group"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="p2p-domain">
          <Form.Label>p2p-domain</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["p2p-domain"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="node1">
          <Form.Label>AGG 1</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.node1}>
            {deviceOption}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="intfTypeNode1">
          <Form.Label>Interface</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.intfTypeNode1}>
            <option>GigabitEthernet</option>
            <option>Bundle-Ether</option>
            <option>TenGigE</option>
            <option>HundredGigE</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="intfNumberNode1">
          <Form.Label>Number</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.intfNumberNode1}>
            {intfNumberSelector1 ? intfNumberSelector1 : <option>-</option>}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="node2">
          <Form.Label>AGG 2</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.node2}>
            {deviceOption}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="intfTypeNode2">
          <Form.Label>Interface</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.intfTypeNode2}>
            <option>GigabitEthernet</option>
            <option>Bundle-Ether</option>
            <option>TenGigE</option>
            <option>HundredGigE</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="intfNumberNode2">
          <Form.Label>Number</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.intfNumberNode2}>
            {intfNumberSelector2 ? intfNumberSelector2 : <option>-</option>}
          </Form.Control>{" "}
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="2" controlId="node3">
          <Form.Label>ACC</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.node3}>
            {deviceOption}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="2" controlId="intfTypeNode3">
          <Form.Label>Interface</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.intfTypeNode3}>
            <option>GigabitEthernet</option>
            <option>Bundle-Ether</option>
            <option>TenGigE</option>
            <option>HundredGigE</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="2" controlId="intfNumberNode3">
          <Form.Label>Number</Form.Label>
          <Form.Control as="select" onChange={props.onChange} value={props.inputParams.intfNumberNode3}>
            {intfNumberSelector3 ? intfNumberSelector3 : <option>-</option>}
          </Form.Control>{" "}
        </Form.Group>
      </Form.Row>
    </>
  );
};

const FormELAN = (props) => {
  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId="service-id">
          <Form.Label>Service name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="eline service"
            onChange={props.onChange}
            value={props.inputParams["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="vlan-id">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="vlan number"
            onChange={props.onChange}
            value={props.inputParams["vlan-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="evpn-evi">
          <Form.Label>Start EVI Number</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["evpn-evi"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="evpn-rt">
          <Form.Label>RT</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["evpn-rt"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="bridge-group">
          <Form.Label>bridge-group</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["bridge-group"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="bridge-domain">
          <Form.Label>bridge-domain</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["bridge-domain"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="node1">
          <Form.Label>AGG 1</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.node1} />
        </Form.Group>
        <Form.Group as={Col} controlId="intfNode1">
          <Form.Label>Interface</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.intfNode1} />
        </Form.Group>
        <Form.Group as={Col} controlId="node2">
          <Form.Label>AGG 2</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.node2} />
        </Form.Group>
        <Form.Group as={Col} controlId="intfNode2">
          <Form.Label>Interface</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.intfNode2} />
        </Form.Group>
        <Form.Group as={Col} controlId="node3">
          <Form.Label>ACC</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.node3} />
        </Form.Group>
        <Form.Group as={Col} controlId="intfNode3">
          <Form.Label>Interface</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.intfNode3} />
        </Form.Group>
      </Form.Row>
    </>
  );
};

const ServiceNew = (props) => {
  const [devices, setDevices] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedService, setSelectedService] = useState("VPWS");
  const [processingDryrun, setProcessingDryrun] = useState(false);
  const [isDeployComplete, setIsDeployComplete] = useState(false);
  const [dryrunResponse, setDryrunResponse] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const history = useHistory();

  const [inputParams, setInputParams] = useState({
    scale: 1,
    "service-id": "TEST",
    "vlan-id": "1000",
    "evpn-evi": "1000",
    //
    labelPE: "1020",
    labelACC: "1020",
    "x-connect-group": "xconnect",
    "p2p-domain": "p2p",
    //
    "evpn-rt": "",
    "bridge-group": "",
    "bridge-domain": "",
    //
    intfTypeNode1: "TenGigE",
    intfTypeNode2: "TenGigE",
    intfTypeNode3: "TenGigE",
    //
    node1: "AGG3_NPE1",
    node2: "AGG4_NPE2",
    node3: "ncs540-5",
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
            devices: [
              {
                device: inputParams.node3,
                "interface-type": inputParams.intfTypeNode3,
                [`${inputParams.intfTypeNode3}-id`]: inputParams.intfNumberNode3,
                "evpn-source": inputParams.labelACC,
                "evpn-target": inputParams.labelPE,
              },
              {
                device: inputParams.node2,
                "interface-type": inputParams.intfTypeNode2,
                [`${inputParams.intfTypeNode2}-id`]: inputParams.intfNumberNode2,
                "evpn-source": inputParams.labelPE,
                "evpn-target": inputParams.labelACC,
              },
              {
                device: inputParams.node1,
                "interface-type": inputParams.intfTypeNode1,
                [`${inputParams.intfTypeNode1}-id`]: inputParams.intfNumberNode1,
                "evpn-source": inputParams.labelPE,
                "evpn-target": inputParams.labelACC,
              },
            ],
          },
        });
      }
      payload["vpws:vpws"] = servicesParams;
    } else if (selectedService === "ELAN") {
      payload["elan:elan"] = {};
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
      setErrMsg(error.response.data);
    }
    setProcessingDryrun(false);
  };

  const serviceCreateHandler = async (e) => {
    e.preventDefault();
    setModalShow(true);

    let data = {
      payload: payloadCreator(),
      status: "active",
      type: selectedService.toLowerCase(),
      scale: inputParams.scale,
      name: inputParams["service-id"],
      st_vlan: inputParams["vlan-id"],
      st_evi: inputParams["evpn-evi"],
      node1: inputParams["node1"],
      node2: inputParams["node2"],
      node3: inputParams["node3"],
      intf1: inputParams["intfTypeNode1"] + inputParams["intfNumberNode1"],
      intf2: inputParams["intfTypeNode2"] + inputParams["intfNumberNode2"],
      intf3: inputParams["intfTypeNode3"] + inputParams["intfNumberNode3"],
      labelACC: inputParams.labelACC,
      labelPE: inputParams.labelPE,
      group: inputParams["x-connect-group"],
      domain: inputParams["p2p-domain"],
    };
    let responseBACKEND = await BACKEND.post("/services/vpws", data);
    if (responseBACKEND.status === 200) {
      // Successfullu save service to DB
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
        setErrMsg(error.response.data);
      }
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
    VPWS: <FormVPWS onChange={onInputChangeHandler} inputParams={inputParams} devices={devices} />,
    ELAN: <FormELAN onChange={onInputChangeHandler} inputParams={inputParams} devices={devices} />,
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
            <p>{errMsg.errors.error[0]["error-message"]}</p>
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
                          <option>VPWS</option>
                          <option>ELAN</option>
                          {/* <option>L3VPN</option> */}
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
