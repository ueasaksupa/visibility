import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
//
// import TopologyComponent from "../topology/TopologyComponent";

const OptimizationResult = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRerouteLsp, setSelectedRerouteLsp] = useState(null);
  const [processSubmitOptimize, setProcessSubmitOptimize] = useState(false);

  const handleOptimizationCommit = async () => {
    setProcessSubmitOptimize(true);
    let payload = { ...props.dryRunPayload };
    payload.input["action-type"] = "commit";
    await props.action(payload);
    setProcessSubmitOptimize(false);
  };

  const renderOptResultTableBody = () => {
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
      <Card className="mt-3">
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
                <tbody>{renderOptResultTableBody()}</tbody>
              </Table>
            </div>
          </div>
          <div className="row m-2">
            <div className="col-md-12">
              <button onClick={handleOptimizationCommit} className="btn btn-primary float-right" disabled={processSubmitOptimize}>
                {processSubmitOptimize && <Spinner animation="grow" size="sm" variant="light" />}
                {"   "}Commit
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
      <Modal size="lg" show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Summary Re-routed LSP</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "500px" }}>
          {/* <TopologyComponent
            disableLinkHover
            disableNodeClick
            topologyData={props.topologyData}
            reroutedPath={selectedRerouteLsp}
          /> */}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OptimizationResult;
