import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";

import TopologyComponent from "../topology/TopologyComponent";

import { WAE_API } from "../api/apiBackend";
import xtcExtractor from "../api/xtcExtractor";
import { SR_PCE_API } from "../api/apiBackend";

const OptimizationResult = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRerouteLsp, setSelectedRerouteLsp] = useState(null);

  const renderLspTableBody = () => {
    const resultObj = props.optimizeResult["hybrid-optimizer:output"]["bandwidth-optimization-results"];
    if ("re-routed-lsps" in resultObj) {
      return resultObj["re-routed-lsps"].map((lsp, index) => {
        return (
          <tr key={index}>
            <td>{lsp.lspName}</td>
            <td>{lsp.lspSrcNode}</td>
            <td>{lsp.lspDstNode}</td>
            <td>{lsp.lspClass}</td>
            <td>{lsp.traffic}</td>
            <td>{lsp.delay}</td>
            <td>
              <button
                className="btn btn-info btn-sm"
                onClick={() => {
                  setModalShow(true);
                  setSelectedRerouteLsp({
                    name: lsp.lspName,
                    lspSrcNode: lsp.lspSrcNode,
                    lspDstNode: lsp.lspDstNode,
                    "original-path": lsp["original-path"],
                    "re-routed-opt-path": lsp["re-routed-opt-path"],
                  });
                }}
              >
                view
              </button>
            </td>
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td colSpan="7" className="text-danger text-center">
            Can not find rerouted LSPs
          </td>
        </tr>
      );
    }
  };
  const renderIntfTableBody = () => {
    const resultObj = props.optimizeResult["hybrid-optimizer:output"]["bandwidth-optimization-results"];
    if ("congested-interfaces" in resultObj) {
      return resultObj["congested-interfaces"].map((intf, index) => {
        return (
          <tr key={index}>
            <td>{intf.intfSrcNode}</td>
            <td>{intf.intfDestNode}</td>
            <td>{intf.intfName}</td>
            <td>{intf.traffic}</td>
            <td>{intf.utilization}</td>
            <td>{intf.capacity}</td>
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td colSpan="6" className="text-success text-center">
            None
          </td>
        </tr>
      );
    }
  };

  if (props.optimizeResult === null) return null;
  const result = props.optimizeResult["hybrid-optimizer:output"]["bandwidth-optimization-results"];
  return (
    <>
      <Card className="mt-3 mb-5">
        <Card.Header>
          <div className="h6">Optimization Result</div>
        </Card.Header>
        <Card.Body>
          <div className="row m-2">
            <div className="col-md-5">
              <div className="h6 text-info">Overview</div>
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th></th>
                    <th>Before</th>
                    <th>After</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Number of congested interfaces</td>
                    <td>{result["num-congested-interfaces-bfr-optimization"]}</td>
                    <td>{result["num-congested-interfaces-aft-optimization"]}</td>
                  </tr>
                  <tr>
                    <td>Maximum interface utilization</td>
                    <td>{result["max-intf-utilization-bfr-optimization"]}</td>
                    <td>{result["max-intf-utilization-aft-optimization"]}</td>
                  </tr>
                  <tr>
                    <td>Number of re-routed LSPs</td>
                    <td colSpan="2">{result["num-of-re-routed-lsps"]}</td>
                  </tr>
                  <tr>
                    <td>Number of deleted LSPs</td>
                    <td>N/A</td>
                    <td>{result["num-of-deleted-lsps"]}</td>
                  </tr>
                  <tr>
                    <td>Number of created LSPs</td>
                    <td>N/A</td>
                    <td>{result["num-of-created-lsps"]}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div className="col-md-7">
              <div className="h6 text-info">Congested interface after re-route</div>
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Interface name</th>
                    <th>Traffic</th>
                    <th>Utilization.</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>{renderIntfTableBody()}</tbody>
              </Table>
            </div>
          </div>
          <div className="row m-2">
            <div className="col-md-12">
              <div className="h6 text-info">Re-routed LSPs</div>
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>LSP Name</th>
                    <th>SrcNode</th>
                    <th>DstNode</th>
                    <th>Class</th>
                    <th>traffic</th>
                    <th>Delay</th>
                    <th>Path</th>
                  </tr>
                </thead>
                <tbody>{renderLspTableBody()}</tbody>
              </Table>
            </div>
          </div>
        </Card.Body>
      </Card>
      <Modal size="lg" show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Summary Re-routed LSP</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "500px" }}>
          <TopologyComponent
            disableLinkHover
            disableNodeClick
            topologyData={props.topologyData}
            reroutedPath={selectedRerouteLsp}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

const CongestedLsp = (props) => {
  const [postThresHold, setPostThresHold] = useState(50);
  const [selectedReopLsp, setSelectedReopLsp] = useState([]);
  const [procFindCong, setProcFindCong] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState(null);

  const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight);

  const handleOnCheckBoxClick = (event, lsp) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      // select
      setSelectedReopLsp([...selectedReopLsp, { lspName: lsp.lspName, lspSrcNode: lsp.lspSrcNode }]);
    } else {
      // de-select
      let tmp = selectedReopLsp.filter((ele) => {
        return ele.lspName !== lsp.lspName;
      });
      setSelectedReopLsp(tmp);
    }
  };

  const handleOptimization = async () => {
    setProcFindCong(true);
    let payload = {
      input: {
        "post-optimization-threshold": postThresHold,
        "lsps-to-be-optimized": [...selectedReopLsp],
        "exclude-vip-tunnels": "true",
        "create-new-lsps": "false",
        "action-type": "dry-run",
      },
    };
    let resp = await WAE_API.post(
      "/api/running/networks/network/ais-demands/opm/hybrid-optimizer/bandwidth/_operations",
      payload,
      {
        headers: { "Content-type": "application/vnd.yang.data+json" },
      },
    );
    if (resp.status === 200) {
      setOptimizeResult(resp.data);
      console.log("resp Opt result:", resp);
    }
    setProcFindCong(false);
    scrollToBottom();
  };

  const handleSliderChange = (event) => {
    let value = event.target.value;
    setPostThresHold(value);
  };

  const renderIntfTableBody = () => {
    return props.congestedLsp["sr-fetch-congestion:output"]["congested-interfaces"].map((intf, index) => {
      return (
        <tr key={index}>
          <td>{intf.intfSrcNode}</td>
          <td>{intf.intfDestNode}</td>
          <td>{intf.intfName}</td>
          <td>{intf.traffic}</td>
          <td>{intf.utilization}</td>
          <td>{intf.capacity}</td>
        </tr>
      );
    });
  };

  const renderLspTableBody = () => {
    return props.congestedLsp["sr-fetch-congestion:output"]["congested-lsps"].map((lsp, index) => {
      return (
        <tr key={index}>
          <td>{lsp.lspName}</td>
          <td>{lsp.lspSrcNode}</td>
          <td>{lsp.lspDstNode}</td>
          <td>{lsp.lspClass}</td>
          <td>{lsp.traffic}</td>
          <td>{lsp.delay}</td>
          <td className="pl-3">
            <input onChange={(e) => handleOnCheckBoxClick(e, lsp)} type="checkbox"></input>
          </td>
        </tr>
      );
    });
  };

  if (props.congestedLsp === null) return null;
  return (
    <>
      <Card className="mt-3">
        <Card.Header>
          <div className="h6">BW Optimization</div>
        </Card.Header>
        <Card.Body>
          <div className="row m-2">
            <div className="col-md-12">
              <div className="h6 text-info">Congested Interfaces</div>
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Interface name</th>
                    <th>Traffic</th>
                    <th>Utilization.</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>{renderIntfTableBody()}</tbody>
              </Table>
            </div>
          </div>
          <div className="row m-2">
            <div className="col-md-12">
              <div className="h6 text-info">Congested LSPs</div>
              <Table striped hover size="sm">
                <thead>
                  <tr>
                    <th>LSP Name</th>
                    <th>SrcNode</th>
                    <th>DstNode</th>
                    <th>Class</th>
                    <th>traffic</th>
                    <th>Delay</th>
                    <th>LSP to optimize</th>
                  </tr>
                </thead>
                <tbody>{renderLspTableBody()}</tbody>
              </Table>
            </div>
          </div>
          <div className="row m-2">
            <div className="col-md-6 d-flex">
              <div className="h6 text-info">Post Optimization Threshold</div>
              <div style={{ width: "25rem" }} className="d-flex ml-3">
                <input
                  type="range"
                  className="custom-range"
                  defaultValue="50"
                  step="1"
                  min="0"
                  max="100"
                  onChange={(e) => handleSliderChange(e)}
                />
                <div className="ml-3">{`${postThresHold}%`}</div>
              </div>
            </div>
            <div className="col-md-6">
              <button onClick={handleOptimization} className="btn btn-primary float-right">
                {procFindCong ? <Spinner animation="border" size="sm" variant="light" /> : null}
                {"   "}Preview
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
      {procFindCong ? (
        <div className="text-center m-3">
          Calculating...{"   "}
          <Spinner animation="border" size="sm" variant="dark" />
        </div>
      ) : (
        <OptimizationResult {...props} optimizeResult={optimizeResult} />
      )}
    </>
  );
};

const LspOptimize = (props) => {
  const [congestionThresHold, setCongestionThresHold] = useState(50);
  const [topologyData, setTopologyData] = useState(null);
  const [congestedLsp, setCongestedLsp] = useState(null);
  const [procFindCong, setProcFindCong] = useState(false);

  const fetchData = async () => {
    let topoR = await SR_PCE_API.get("/topo/subscribe/txt");
    let extractor = new xtcExtractor();
    setTopologyData(extractor.getTopologyObject(topoR.data));
  };

  const handleFindCongestion = async () => {
    setProcFindCong(true);
    let payload = { input: { "interface-utilization": congestionThresHold } };
    let resp = await WAE_API.post("/api/running/networks/network/ais-demands/opm/sr-fetch-congestion/run/_operations", payload, {
      headers: { "Content-type": "application/vnd.yang.data+json" },
    });
    if (resp.status === 204) {
      setCongestedLsp(null);
      console.log("resp congestion inf:", resp);
    } else {
      setCongestedLsp(resp.data);
      console.log("resp congestion inf:", resp);
    }
    setProcFindCong(false);
  };

  const handleSliderChange = (event) => {
    let value = event.target.value;
    setCongestionThresHold(value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
      <Card className="mt-3">
        <Card.Header>
          <div className="h6">Interface Congestion Threshold</div>
        </Card.Header>
        <Card.Body>
          <div className="row m-2">
            <div className="col-md-10 col-sm-6">
              <div className="d-flex">
                <input
                  type="range"
                  className="custom-range"
                  defaultValue="50"
                  step="1"
                  min="0"
                  max="100"
                  onChange={(e) => handleSliderChange(e)}
                />
                <div className="ml-3">{`${congestionThresHold}%`}</div>
              </div>
            </div>
            <div className="col-md-2 col-sm-6">
              <button style={{ width: "135px" }} onClick={handleFindCongestion} className="btn btn-primary float-right">
                {procFindCong ? <Spinner animation="border" size="sm" variant="light" /> : "Find congestions"}
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
      <CongestedLsp topologyData={topologyData} congestedLsp={congestedLsp} />
    </div>
  );
};

export default LspOptimize;
