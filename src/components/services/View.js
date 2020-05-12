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
  const [vpwsService, setVpwsService] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState([]);
  const [processing, setProcessing] = useState(null);

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

  const handleServiceUndeploy = () => {
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

  const fetchServices = async (e) => {
    let response = await BACKEND.get("/services/vpws");
    setVpwsService(response.data.response);
  };

  const renderVpwsTableBody = () => {
    // console.log(vpwsService);
    return vpwsService.map((ele, index) => {
      return (
        <tr key={index}>
          <td>
            <input id="serviceSelectBox" onChange={(e) => handleOnCheckBoxClick(e, ele)} type="checkbox"></input>
          </td>
          <td>
            {" "}
            <Badge variant="primary">{ele.status}</Badge>
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
          <button
            className={"bg-blue btn btn-primary btn-sm float-right " + (selectedService.length === 0 ? "disabled" : "")}
            onClick={() => console.log("click")}
          >
            {"   "}Re-deploy
          </button>
          <button
            className={"bg-blue btn btn-primary btn-sm float-right " + (selectedService.length === 0 ? "disabled" : "")}
            onClick={handleServiceUndeploy}
          >
            {"   "}Un-deploy
          </button>
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
            <tbody>
              <tr>
                <td>
                  <input type="checkbox" />
                </td>
                <td>
                  <Badge variant="primary">active</Badge>
                </td>
                <td>Background Traffic ELAN (PE to PE) slice Bandwidth</td>
                <td>2051-3050</td>
                <td>12051-13050</td>
                <td>NPE1</td>
                <td>TenGigE0/9/0/45</td>
                <td>-</td>
                <td>-</td>
                <td>UPE1</td>
                <td>TenGigE0/7/0/0</td>
                <td>1000</td>
                <td>elan-bg-bw</td>
                <td>elan</td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" />
                </td>
                <td>
                  {" "}
                  <Badge variant="primary">active</Badge>
                </td>
                <td>Background Traffic ELAN (PE to PE) slice Latency</td>
                <td>3051-4050</td>
                <td>13051-14050</td>
                <td>NPE1</td>
                <td>TenGigE0/9/0/45</td>
                <td>-</td>
                <td>-</td>
                <td>UPE1</td>
                <td>TenGigE0/7/0/0</td>
                <td>2000</td>
                <td>elan-bg-lt</td>
                <td>elan</td>
              </tr>
            </tbody>
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
