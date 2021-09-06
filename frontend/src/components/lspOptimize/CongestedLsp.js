import React, { useState, useEffect } from "react";
//
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import DataTable from "react-data-table-component";
//
const CongestedLsp = (props) => {
  const [postThresHold, setPostThresHold] = useState(50);
  const [selectedReopLsp, setSelectedReopLsp] = useState([]);
  const [currentExpandRow, setCurrentExpandRow] = useState([]);
  const [futurePathOptionList, setFuturePathOptionList] = useState({});
  const [processOptimizeDryrun, setProcessOptimizeDryrun] = useState(false);

  const handleOnCheckBoxClick = (event, group) => {
    // using for store tmp list of lsp related to the event, helper for deselect filter function.
    let tmpTargetLspName = [];
    // prepare list of lsp to be selected/de-selected.
    let lspList;
    if (group.lsps) {
      // it is checkbox from group row
      lspList = group.lsps.map((lsp) => {
        tmpTargetLspName.push(lsp.lspName);
        return {
          lspName: lsp.lspName,
          lspSrcNode: lsp.lspSrcNode,
          futurePathOption: futurePathOptionList[lsp.lspName],
          // currentActivePathOption: lsp.activeCandPathPref,
        };
      });
    } else {
      // it is checkbox from expanded row
      tmpTargetLspName.push(group.lspName);
      lspList = [
        {
          lspName: group.lspName,
          lspSrcNode: group.lspSrcNode,
          futurePathOption: futurePathOptionList[group.lspName],
          // currentActivePathOption: group.activeCandPathPref,
        },
      ];
    }
    //
    const isChecked = event.target.checked;
    if (isChecked) {
      // select
      setSelectedReopLsp([...selectedReopLsp, ...lspList]);
    } else {
      // de-select
      let tmp = selectedReopLsp.filter((ele) => {
        return !tmpTargetLspName.includes(ele.lspName);
      });
      setSelectedReopLsp(tmp);
    }
  };

  const handleOptimizationDryrun = async () => {
    setProcessOptimizeDryrun(true);
    let payload = {
      input: {
        "post-optimization-threshold": postThresHold,
        "lsps-to-be-optimized": [...selectedReopLsp],
        "exclude-vip-tunnels": "true",
        "create-new-lsps": "false",
        "action-type": "dry-run",
        "perform-opt-on": props.selectedSlice,
      },
    };
    await props.action(payload);
    setProcessOptimizeDryrun(false);
  };

  const handleSliderChange = (event) => {
    let value = event.target.value;
    setPostThresHold(value);
  };

  const handleOnPathOptionChange = (event, row) => {
    setFuturePathOptionList({ ...futurePathOptionList, [row.lspName]: event.target.value });
    let i = selectedReopLsp.findIndex((el) => el.lspName === row.lspName);
    if (i >= 0) {
      let tmp = [...selectedReopLsp];
      tmp[i].futurePathOption = event.target.value;
      setSelectedReopLsp([...tmp]);
    }
  };

  const searchLspSelectedState = (lspName) => {
    for (const i of selectedReopLsp) {
      if (i.lspName === lspName) return true;
    }
    return false;
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

  const renderCongestedLspTableBody = () => {
    let groupedCongestedLsp = {};
    props.congestedLsp["sr-fetch-congestion:output"]["congested-lsps"].forEach((lsp, index) => {
      let color = parseInt(lsp.lspName.split("_")[2]);
      let service;
      if (color === 100) {
        service = "Service bandwidth-slice";
      } else if (color === 200) {
        service = "Service latency-slice";
      } else if (color === 300) {
        service = "Service special-slice";
      } else if (color > 10000 && color < 20000) {
        service = "Background bandwidth-slice";
      } else if (color > 20000 && color < 30000) {
        service = "Background latency-slice";
      } else if (color > 30000 && color < 40000) {
        service = "Background special-slice";
      } else {
        service = "unknown";
      }
      if (groupedCongestedLsp[service + lsp.lspSrcNode + lsp.lspDstNode] === undefined) {
        // if not found create new record
        groupedCongestedLsp[service + lsp.lspSrcNode + lsp.lspDstNode] = {
          traffic: parseInt(lsp.traffic.split(" ")[0]),
          service: service,
          lspSrcNode: lsp.lspSrcNode,
          lspDstNode: lsp.lspDstNode,
          lsps: [
            {
              id: index,
              lspName: lsp.lspName,
              traffic: lsp.traffic,
              delay: lsp.delay,
              lspSrcNode: lsp.lspSrcNode,
              activeCandPathPref: lsp.activeCandPathPref,
            },
          ],
        };
      } else {
        // push the lsp name into list
        groupedCongestedLsp[service + lsp.lspSrcNode + lsp.lspDstNode].lsps.push({
          id: index,
          lspName: lsp.lspName,
          traffic: lsp.traffic,
          delay: lsp.delay,
          lspSrcNode: lsp.lspSrcNode,
          activeCandPathPref: lsp.activeCandPathPref,
        });
        groupedCongestedLsp[service + lsp.lspSrcNode + lsp.lspDstNode].traffic += parseInt(lsp.traffic.split(" ")[0]);
      }
    });

    const tableColumns = [
      {
        name: "Name",
        selector: "lspName",
        sortable: true,
      },
      {
        name: "Traffic",
        selector: "traffic",
        sortable: true,
      },
      {
        name: "Delay",
        selector: "delay",
        sortable: true,
      },
      {
        name: "activePathOption",
        selector: "activeCandPathPref",
      },
      {
        name: "futurePathOption",
        cell: (row) => {
          return (
            <select
              className="custom-select custom-select-sm"
              style={{ width: "100px" }}
              value={futurePathOptionList[row.lspName]}
              onChange={(e) => handleOnPathOptionChange(e, row)}
            >
              <option disabled={row.activeCandPathPref > 30} value="40">
                40
              </option>
              <option disabled={row.activeCandPathPref > 60} value="70">
                70
              </option>
              <option disabled={row.activeCandPathPref > 100} value="110">
                110
              </option>
            </select>
          );
        },
      },
      {
        name: "LSP to optimize",
        sortable: false,
        cell: (row) => (
          <input
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleOnCheckBoxClick(e, row)}
            type="checkbox"
            defaultChecked={searchLspSelectedState(row.lspName)}
          ></input>
        ),
      },
    ];

    let returnJSXobject = [];
    for (const key in groupedCongestedLsp) {
      returnJSXobject.push(
        <tr
          key={key}
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (currentExpandRow.includes(key)) {
              // collapse
              let tmp = currentExpandRow.filter((ele) => {
                return ele !== key;
              });
              setCurrentExpandRow([...tmp]);
            } else {
              // visible
              setCurrentExpandRow([...currentExpandRow, key]);
            }
          }}
        >
          <td>{groupedCongestedLsp[key].service}</td>
          <td>{groupedCongestedLsp[key].lspSrcNode}</td>
          <td>{groupedCongestedLsp[key].lspDstNode}</td>
          <td>{groupedCongestedLsp[key].traffic} Mbps</td>
          <td>{groupedCongestedLsp[key].lsps.length}</td>
          <td className="pl-3">
            <input
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleOnCheckBoxClick(e, groupedCongestedLsp[key])}
              type="checkbox"
            ></input>
          </td>
        </tr>,
      );
      currentExpandRow.includes(key) &&
        returnJSXobject.push(
          <tr key={key + "_"}>
            <td colSpan="6">
              <DataTable pagination dense noHeader columns={tableColumns} data={groupedCongestedLsp[key].lsps} />
            </td>
          </tr>,
        );
    }
    return returnJSXobject;
  };

  useEffect(() => {
    if (props.congestedLsp) {
      let pathOptionDict = {};
      props.congestedLsp["sr-fetch-congestion:output"]["congested-lsps"].forEach((el) => {
        pathOptionDict[el.lspName] = (parseInt(el.activeCandPathPref) + 10).toString();
      });
      setFuturePathOptionList({ ...pathOptionDict });
    } else {
      // reset state when component not appear
      setSelectedReopLsp([]);
      setCurrentExpandRow([]);
      setFuturePathOptionList({});
    }
  }, [props.congestedLsp]);

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
                    <th>Service</th>
                    <th>SrcNode</th>
                    <th>DstNode</th>
                    <th>traffic</th>
                    <th># LSPs</th>
                    <th>LSP to optimize</th>
                  </tr>
                </thead>
                <tbody>{renderCongestedLspTableBody()}</tbody>
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
              <button
                onClick={handleOptimizationDryrun}
                className="btn btn-sm btn-primary float-right"
                disabled={processOptimizeDryrun}
              >
                {processOptimizeDryrun ? (
                  <>
                    <Spinner animation="grow" size="sm" variant="light" />
                    {"   "}Calculating
                  </>
                ) : (
                  "Preview"
                )}
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default CongestedLsp;
