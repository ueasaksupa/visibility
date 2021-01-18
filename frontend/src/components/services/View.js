import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import ProgressBar from "react-bootstrap/ProgressBar";
import DataTable from "react-data-table-component";

import { NSO_API } from "../api/apiBackend";
import BACKEND from "../api/pythonBackend";

const ServiceView = (props) => {
  const [currentService, setCurrentService] = useState({});
  const [selectedService, setSelectedService] = useState([]);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState([]);
  const [processing, setProcessing] = useState("");

  const findNumberOfSelectService = () => {
    let num = 0;
    selectedService.forEach((ele) => {
      // console.log(ele);
      num += ele.payload[`${ele.type}:${ele.type}`].length;
    });
    return num;
  };

  const handleOnCheckBoxClick = (event, service) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      // select
      setSelectedService([...selectedService, service]);
    } else {
      // de-select
      let tmp = selectedService.filter((ele) => {
        return ele.name !== service.name;
      });
      setSelectedService(tmp);
    }
  };

  const handleServiceDelete = () => {
    // check if no selected service. Do nothing
    if (selectedService.length === 0) return;

    setDeleteModalShow(true);
    for (const ele of selectedService) {
      const type = ele.type;
      for (const service of ele.payload[`${type}:${type}`]) {
        NSO_API.delete(`/restconf/data/${type}:${type}=${service["service-id"]}`).then((response) => {
          console.log("delete service: ", service["service-id"]);
          setDeleteProgress((deleteProgress) => [...deleteProgress, service["service-id"]]);
        });
      }
      BACKEND.delete(`/services/${type.toLowerCase()}/${ele.name}`).then((response) => {
        console.log("delete service: ", ele.name);
      });
    }
  };

  const handleServiceAction = async (action) => {
    setProcessing(action);
    for (const ele of selectedService) {
      const type = ele.type;
      for (const service of ele.payload[`${type}:${type}`]) {
        await NSO_API.post(`/restconf/data/${type}:${type}=${service["service-id"]}/${action}`);
        console.log(`${action} service: `, service["service-id"]);
      }
      await BACKEND.patch(`/services/${type.toLowerCase()}/${ele.name}`, {
        changeStatusTo: action === "re-deploy" ? "active" : action,
      });
      console.log(`${action} service: `, ele.name);
    }
    setProcessing(null);
    fetchServices();
  };

  const fetchServices = (e) => {
    const serviceList = ["vpws", "elan", "l3vpnbgp", "l3vpnconnected", "l3vpnstatic", "l2l3"];
    serviceList.forEach((ele) => {
      BACKEND.get(`/services/${ele}`).then((response) => {
        setCurrentService((currentService) => ({ ...currentService, [ele]: response.data.response }));
      });
    });
  };

  const countServiceStatus = (service) => {
    let output = { active: 0, inactive: 0 };
    if (typeof currentService[service] !== "object") return output;
    for (let ele of currentService[service]) {
      if (ele.status === "active") {
        output.active = output.active + parseInt(ele.scale);
      } else {
        output.inactive = output.inactive + parseInt(ele.scale);
      }
    }
    return output;
  };

  const renderVpwsTableBody = () => {
    if (!currentService.vpws) return null;
    return currentService.vpws.map((ele, index) => {
      return (
        <tr key={index}>
          <td>
            <input id="serviceSelectBox" onChange={(e) => handleOnCheckBoxClick(e, ele)} type="checkbox"></input>
          </td>
          <td>
            {" "}
            <Badge variant={ele.status === "active" ? "primary" : "secondary"}>{ele.status}</Badge>
          </td>
          <td>{ele.name}</td>
          <td>{ele.scale === 1 ? ele.st_vlan : `${ele.st_vlan}-${parseInt(ele.st_vlan) + parseInt(ele.scale) - 1}`}</td>
          <td>{ele.scale === 1 ? ele.st_evi : `${ele.st_evi}-${parseInt(ele.st_evi) + parseInt(ele.scale) - 1}`}</td>
          <td>{ele.labelPE}</td>
          <td>{ele.labelACC}</td>
          <td>{ele.group}</td>
          <td>{ele.domain}</td>
        </tr>
      );
    });
  };

  const renderElanTableBody = () => {
    if (!currentService.elan) return null;
    return currentService.elan.map((ele, index) => {
      return (
        <tr key={index}>
          <td>
            <input id="serviceSelectBox" onChange={(e) => handleOnCheckBoxClick(e, ele)} type="checkbox"></input>
          </td>
          <td>
            {" "}
            <Badge variant={ele.status === "active" ? "primary" : "secondary"}>{ele.status}</Badge>
          </td>
          <td>{ele.name}</td>
          <td>{ele.scale === 1 ? ele.st_vlan : `${ele.st_vlan}-${parseInt(ele.st_vlan) + parseInt(ele.scale) - 1}`}</td>
          <td>{ele.scale === 1 ? ele.st_evi : `${ele.st_evi}-${parseInt(ele.st_evi) + parseInt(ele.scale) - 1}`}</td>
          <td>{ele.rt}</td>
          <td>{ele.group}</td>
          <td>{ele.domain}</td>
        </tr>
      );
    });
  };

  const renderL3TableBody = (service) => {
    if (!currentService[service]) return null;
    return currentService[service].map((ele, index) => {
      return (
        <tr key={index}>
          <td>
            <input id="serviceSelectBox" onChange={(e) => handleOnCheckBoxClick(e, ele)} type="checkbox"></input>
          </td>
          <td>
            {" "}
            <Badge variant={ele.status === "active" ? "primary" : "secondary"}>{ele.status}</Badge>
          </td>
          <td>{ele.name}</td>
          <td>{ele.scale === 1 ? ele.st_vlan : `${ele.st_vlan}-${parseInt(ele.st_vlan) + parseInt(ele.scale) - 1}`}</td>
          <td>{ele.rt}</td>
          <td>{ele.vrf}</td>
        </tr>
      );
    });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="d-md-flex h-100 w-100">
      <div className="content-panel-left h-100 mb-sm-2 mr-md-4 ml-md-2 mt-md-2 mb-md-0" style={{ width: "20%" }}>
        <div className="container-fluid">
          <div className="h3">Services</div>
        </div>
        <div className="container-fluid">
          <div>L2VPN</div>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              E-LAN
              <div>
                <span className="badge badge-primary mr-1">{countServiceStatus("elan").active}</span>
                <span className="badge badge-secondary mr-1">{countServiceStatus("elan").inactive}</span>
              </div>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              VPWS
              <div>
                <span className="badge badge-primary mr-1">{countServiceStatus("vpws").active}</span>
                <span className="badge badge-secondary mr-1">{countServiceStatus("vpws").inactive}</span>
              </div>
            </li>
          </ul>
          <div>L3VPN</div>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Static
              <div>
                <span className="badge badge-primary mr-1">{countServiceStatus("l3vpnstatic").active}</span>
                <span className="badge badge-secondary mr-1">{countServiceStatus("l3vpnstatic").inactive}</span>
              </div>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Connected
              <div>
                <span className="badge badge-primary mr-1">{countServiceStatus("l3vpnconnected").active}</span>
                <span className="badge badge-secondary mr-1">{countServiceStatus("l3vpnconnected").inactive}</span>
              </div>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              BGP
              <div>
                <span className="badge badge-primary mr-1">{countServiceStatus("l3vpnbgp").active}</span>
                <span className="badge badge-secondary mr-1">{countServiceStatus("l3vpnbgp").inactive}</span>
              </div>
            </li>
          </ul>
          <div>L2L3</div>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              L2L3
              <div>
                <span className="badge badge-primary mr-1">{countServiceStatus("l2l3").active}</span>
                <span className="badge badge-secondary mr-1">{countServiceStatus("l2l3").inactive}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="content-panel-right h-100 mb-sm-2 mt-md-2 mb-md-0" style={{ width: "80%" }}>
        <div className="container-fluid">
          <div className="btn-group btn-group-sm float-right">
            <Link className="bg-blue btn btn-primary btn-sm float-right" to="/service/new">
              <i className="fas fa-plus" />
            </Link>
            {processing === "re-deploy" ? (
              <button className="bg-blue btn btn-primary btn-sm float-right disabled" style={{ minWidth: "85px" }}>
                <Spinner animation="grow" as="span" size="sm" />
              </button>
            ) : (
              <button
                className={"bg-blue btn btn-primary btn-sm float-right " + (selectedService.length === 0 ? "disabled" : "")}
                onClick={() => handleServiceAction("re-deploy")}
              >
                {"   "}Re-deploy
              </button>
            )}
            {processing === "un-deploy" ? (
              <button className="bg-blue btn btn-primary btn-sm float-right disabled" style={{ minWidth: "85px" }}>
                <Spinner animation="grow" as="span" size="sm" />
              </button>
            ) : (
              <button
                className={"bg-blue btn btn-primary btn-sm float-right " + (selectedService.length === 0 ? "disabled" : "")}
                onClick={() => handleServiceAction("un-deploy")}
              >
                {"   "}Un-deploy
              </button>
            )}
            <button
              className={"btn btn-danger btn-sm float-right " + (selectedService.length === 0 ? "disabled" : "")}
              onClick={handleServiceDelete}
            >
              {"   "}Delete
            </button>
          </div>
        </div>
        <div className="container-fluid mt-3">
          <div className="h6">VPWS</div>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>status</th>
                  <th>Service</th>
                  <th>Vlan</th>
                  <th>EVI</th>
                  <th>Label PE</th>
                  <th>Label ACC</th>
                  <th>Group</th>
                  <th>Domain</th>
                </tr>
              </thead>
              <tbody>{renderVpwsTableBody()}</tbody>
            </Table>
          </div>
          <div className="h6">ELAN</div>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>status</th>
                  <th>Service</th>
                  <th>Vlan</th>
                  <th>EVI</th>
                  <th>RT</th>
                  <th>Group</th>
                  <th>Domain</th>
                </tr>
              </thead>
              <tbody>{renderElanTableBody()}</tbody>
            </Table>
          </div>
          <div className="h6">L3VPN BGP</div>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>status</th>
                  <th>Service</th>
                  <th>Vlan</th>
                  <th>RT</th>
                  <th>VRF</th>
                </tr>
              </thead>
              <tbody>{renderL3TableBody("l3vpnbgp")}</tbody>
            </Table>
          </div>
          <div className="h6">L3VPN Static</div>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>status</th>
                  <th>Service</th>
                  <th>Vlan</th>
                  <th>RT</th>
                  <th>VRF</th>
                </tr>
              </thead>
              <tbody>{renderL3TableBody("l3vpnstatic")}</tbody>
            </Table>
          </div>
          <div className="h6">L3VPN Connected</div>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>status</th>
                  <th>Service</th>
                  <th>Vlan</th>
                  <th>RT</th>
                  <th>VRF</th>
                </tr>
              </thead>
              <tbody>{renderL3TableBody("l3vpnconnected")}</tbody>
            </Table>
          </div>
          <div className="h6">L2L3 service</div>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>status</th>
                  <th>Service</th>
                  <th>Vlan</th>
                  <th>RT</th>
                  <th>VRF</th>
                </tr>
              </thead>
              <tbody>{renderL3TableBody("l2l3")}</tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal show={deleteModalShow} backdrop="static">
        <Modal.Body>
          <ProgressBar
            now={(deleteProgress.length / findNumberOfSelectService()) * 100}
            label={`${((deleteProgress.length / findNumberOfSelectService()) * 100).toPrecision(3)}%`}
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            className="bg-blue btn btn-primary btn-sm"
            onClick={() => {
              fetchServices();
              setSelectedService([]);
              setDeleteModalShow(false);
              setDeleteProgress([]);
            }}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ServiceView;
