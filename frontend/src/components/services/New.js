import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";

import FormVPWS from "./FormVPWS";
import FormELAN from "./FormELAN";
import FormL3VPNBGP from "./FormL3VPNBGP";
import FormL3VPNCONNECTED from "./FormL3VPNCONNECTED";
import FormL3VPNSTATIC from "./FormL3VPNSTATIC";
import FormL2L3 from "./FormL2L3";
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

const DryrunSection = (props) => {
  if (props.dryrunResponse) {
    return (
      <div className="card my-3" id="dry-run-result">
        <div className="card-header">
          <div className="row">
            <div className="col-md-6">Dry-run result</div>
          </div>
        </div>
        <Tab.Container id="left-tabs-example" defaultActiveKey="0">
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <NavLinkList dryrunResponse={props.dryrunResponse} />
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content className="my-3">
                <NavLinkData dryrunResponse={props.dryrunResponse} />
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
        <div className="card-footer text-right">
          <button className="bg-blue btn btn-primary btn-sm" onClick={props.serviceCreateHandler}>
            Confirm to deploy
          </button>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

const ServiceNew = (props) => {
  const [devices, setDevices] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedService, setSelectedService] = useState("L3VPNCONNECTED");
  const [processingDryrun, setProcessingDryrun] = useState(false);
  const [isDeployComplete, setIsDeployComplete] = useState(false);
  const [dryrunResponse, setDryrunResponse] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const history = useHistory();
  const formRef = useRef();

  const [inputParams, setInputParams] = useState({
    devices: [],
    scale: 1,
  });

  const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight);

  const serviceDryRunHandler = async (e) => {
    e.preventDefault();
    setProcessingDryrun(true);
    setDryrunResponse(null);

    let data = formRef.current.createPayload();
    console.log("payload: ", data);
    try {
      let response = await NSO_API.post("restconf/data?dry-run=native", data);

      if (response.status === 201) {
        setDryrunResponse(response.data["dry-run-result"].native.device);
        scrollToBottom();
        console.log("response dryrun: ", response);
      }
    } catch (error) {
      console.log(error);
      console.log("err dryrun: ", error.response);
      setErrMsg(error.response.data.errors.error[0]["error-message"]);
    }
    setProcessingDryrun(false);
  };

  const serviceCreateHandler = async (e) => {
    e.preventDefault();
    setModalShow(true);
    let data = formRef.current.createDBPayload();
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
    VPWS: <FormVPWS ref={formRef} devices={devices} scale={inputParams.scale} />,
    ELAN: <FormELAN ref={formRef} devices={devices} scale={inputParams.scale} />,
    L3VPNBGP: <FormL3VPNBGP ref={formRef} devices={devices} />,
    L3VPNSTATIC: <FormL3VPNSTATIC ref={formRef} devices={devices} />,
    L3VPNCONNECTED: <FormL3VPNCONNECTED ref={formRef} devices={devices} />,
    L2L3: <FormL2L3 ref={formRef} devices={devices} />,
  };

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
                          <option value="L2L3">L2+L3</option>
                          <option value="L3VPNBGP">L3VPN BGP</option>
                          <option value="L3VPNSTATIC">L3VPN Static</option>
                          <option value="L3VPNCONNECTED">L3VPN Connected</option>
                        </Form.Control>
                      </Form.Group>
                      {!selectedService.includes("L3") && (
                        <Form.Group as={Col} md="2" sm="3" controlId="scale">
                          <Form.Label>Scale factor</Form.Label>
                          <Form.Control required type="number" value={inputParams.scale} onChange={onInputChangeHandler} />
                        </Form.Group>
                      )}
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
        <DryrunSection dryrunResponse={dryrunResponse} serviceCreateHandler={serviceCreateHandler} />
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
