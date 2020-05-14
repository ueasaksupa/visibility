import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import ProgressBar from "react-bootstrap/ProgressBar";

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
    setDeleteModalShow(true);
    for (const ele of selectedService) {
      const type = ele.type;
      for (const service of ele.payload[`${type}:${type}`]) {
        NSO_API.delete(`/restconf/data/${type}:${type}=${service["service-id"]}`).then((response) => {
          console.log("delete service: ", service["service-id"]);
          setDeleteProgress((deleteProgress) => [...deleteProgress, service["service-id"]]);
        });
      }
      BACKEND.delete(`/services/${type}/${ele.name}`).then((response) => {
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
      await BACKEND.patch(`/services/${type}/${ele.name}`, { changeStatusTo: action === "re-deploy" ? "active" : action });
      console.log(`${action} service: `, ele.name);
    }
    setProcessing(null);
    fetchServices();
  };

  const fetchServices = (e) => {
    const serviceList = ["vpws", "elan"];
    serviceList.forEach((ele) => {
      BACKEND.get(`/services/${ele}`).then((response) => {
        setCurrentService((currentService) => ({ ...currentService, [ele]: response.data.response }));
      });
    });
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
          <td>{ele.node1}</td>
          <td>{ele.intf1}</td>
          <td>{ele.node2}</td>
          <td>{ele.intf2}</td>
          <td>{ele.node3}</td>
          <td>{ele.intf3}</td>
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
          <td>{ele.node1}</td>
          <td>{ele.intf1}</td>
          <td>{ele.node2}</td>
          <td>{ele.intf2}</td>
          <td>{ele.node3}</td>
          <td>{ele.intf3}</td>
          <td>{ele.rt}</td>
          <td>{ele.group}</td>
          <td>{ele.domain}</td>
        </tr>
      );
    });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <>
      <div className="container-fluid">
        <div className="btn-group btn-group-sm float-right">
          <Link className="bg-blue btn btn-primary btn-sm float-right" to="/service/new">
            <i className="fas fa-plus" />
            {"   "}new
          </Link>
          {processing === "re-deploy" ? (
            <button className="bg-blue btn btn-primary btn-sm float-right disabled">
              <Spinner animation="border" as="span" size="sm" />
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
            <button className="bg-blue btn btn-primary btn-sm float-right disabled">
              <Spinner animation="border" as="span" size="sm" />
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
        <div className="h3">Service overview</div>
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
                <th>Node 1</th>
                <th>Intf 1</th>
                <th>Node 2</th>
                <th>Intf 2</th>
                <th>Node 3</th>
                <th>Intf 3</th>
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
                <th>Node 1</th>
                <th>Intf 1</th>
                <th>Node 2</th>
                <th>Intf 2</th>
                <th>Node 3</th>
                <th>Intf 3</th>
                <th>RT</th>
                <th>Group</th>
                <th>Domain</th>
              </tr>
            </thead>
            <tbody>{renderElanTableBody()}</tbody>
          </Table>
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
    </>
  );
};

export default ServiceView;
