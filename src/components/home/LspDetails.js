import React, { useState, useEffect } from "react";

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";

import xtcExtractor from "../api/xtcExtractor";
import { SR_PCE_API } from "../api/apiBackend";

const LspPathDetail = (props) => {
  if (props.selectedLsp === null) {
    return <div style={{ margin: "0 1rem 1rem" }}>Select Lsp on table above to see path detail</div>;
  }
  return (
    <Card>
      <Card.Header>LSP Path - {props.selectedLsp.lspName}</Card.Header>
      <Card.Body>
        <div>{props.selectedLsp.path.join(" -> ")}</div>
      </Card.Body>
    </Card>
  );
};

const LspDetails = (props) => {
  const [lspData, setLspData] = useState(null);
  const [selectedLsp, setSelectedLsp] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let lspR = await SR_PCE_API.get("/lsp/subscribe/txt?max-lsp-history=0&batch=0");
    console.log("lspR:", lspR);
    let extractor = new xtcExtractor();
    setLspData(extractor.getLspObject(lspR.data));
  };

  const onRefreshButton = () => {
    setLspData(null);
    fetchData();
  };

  const renderTablebody = () => {
    const row = [];
    let index = 0;
    for (const lspName in lspData) {
      row.push(
        <tr
          key={index}
          className={selectedLsp ? (selectedLsp.lspName === lspName ? "lsp-detail active" : "lsp-detail") : "lsp-detail"}
          onClick={() => {
            if (selectedLsp !== null) {
              if (selectedLsp.lspName === lspName) {
                // De-selection
                setSelectedLsp(null);
                props.onLspTableClick(null);
              } else {
                // Change selection
                setSelectedLsp(lspData[lspName]);
                props.onLspTableClick(lspData[lspName]);
              }
            } else {
              // select init
              setSelectedLsp(lspData[lspName]);
              props.onLspTableClick(lspData[lspName]);
            }
          }}
        >
          {lspData[lspName].operationalState === "lsp-up" ? (
            <td className="text-center">
              <Badge pill variant="success">
                Up
              </Badge>
            </td>
          ) : (
            <td className="text-center">
              <Badge pill variant="danger">
                Down
              </Badge>
            </td>
          )}
          <td>{lspName}</td>
          <td>{lspData[lspName].source}</td>
          <td>{lspData[lspName].target}</td>
          <td>{lspData[lspName].bindingSid}</td>
          <td>{lspData[lspName].color}</td>
        </tr>,
      );
      index += 1;
    }
    return row;
  };

  if (lspData !== null) {
    return (
      <>
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex">
              <div className="mr-4">LSP Details</div>
              <div>
                <button onClick={onRefreshButton} className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-sync-alt buttonize"></i>
                </button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="lsp-table">
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Tunnel Name</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>BindingSID</th>
                    <th>Color</th>
                  </tr>
                </thead>
                <tbody>{renderTablebody()}</tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        <LspPathDetail selectedLsp={selectedLsp} />
      </>
    );
  } else {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
};

export default LspDetails;
