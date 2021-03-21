import React, { useState, useRef, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
//
import { useLspOptimizeContext } from "./ContextProvider";
import CongestedLsp from "./CongestedLsp";
import OptimizationResult from "./OptimazationResult";
//
import BACKEND from "../api/pythonBackend";
import { WAE_API } from "../api/apiBackend";
// import xtcExtractor from "../api/xtcExtractor";
// import { SR_PCE_API } from "../api/apiBackend";

const LspOptimize = (props) => {
  const [state, dispatch] = useLspOptimizeContext();
  //
  const [congestionThresHold, setCongestionThresHold] = useState(50);
  const [processFindConguest, setProcessFindConguest] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState("special-slice");
  const [errMsg, setErrMsg] = useState(null);
  const dryRunPayloadRef = useRef();

  const handleOptimizationCommit = async (payload) => {
    dispatch({ type: "updateFindCongestedLsp", payload: null });
    dispatch({ type: "updateOptimizeResult", payload: null });
    try {
      let resp = await BACKEND.post("/lsp-optimize", payload);
      if (resp.status === 200) {
        let newHistory = await BACKEND.get("/lsp-optimize");
        dispatch({ type: "updateOptimizeHistory", payload: newHistory.data.response });
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        setErrMsg(error.response.data.errors.error[0]["error-message"]);
      } else {
        setErrMsg("Network error or timeout.");
      }
    }
  };

  const handleOptimizationDryrun = async (payload) => {
    dispatch({ type: "updateOptimizeResult", payload: null });
    try {
      let response = await WAE_API.post(
        "/restconf/data/cisco-wae:networks/network=ais_bw_slice_final/opm/hybrid-optimizer:hybrid-optimizer/bandwidth/",
        payload,
      );
      if (response.status === 200) {
        dryRunPayloadRef.current = payload;
        dispatch({ type: "updateOptimizeResult", payload: response.data });
        console.log("response Opt result:", response);
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        setErrMsg(error.response.data.errors.error[0]["error-message"]);
      } else {
        setErrMsg("Network error or timeout. (check conectivity to the backend)");
      }
    }
  };

  const handleFindCongestion = async () => {
    setProcessFindConguest(true);
    let payload = { input: { "interface-utilization": congestionThresHold, "perform-opt-on": selectedSlice } };
    try {
      let response = await WAE_API.post(
        "/restconf/data/cisco-wae:networks/network=ais_bw_slice_final/opm/sr-fetch-congestion:sr-fetch-congestion/run/",
        payload,
      );
      if (response.status === 204) {
        dispatch({ type: "updateFindCongestedLsp", payload: null });
        console.log("response congestion inf:", response);
      } else {
        dispatch({ type: "updateFindCongestedLsp", payload: response.data });
        console.log("response congestion inf:", response);
      }
    } catch (error) {
      console.log(error);
      setErrMsg("Network error or timeout. (check conectivity to the backend)");
    }
    setProcessFindConguest(false);
  };

  const handleSliderChange = (event) => {
    let value = event.target.value;
    setCongestionThresHold(value);
  };

  return (
    <>
      {errMsg && (
        <Alert variant="danger" onClose={() => setErrMsg(null)} dismissible>
          <strong>You got an error!</strong> : {errMsg}
        </Alert>
      )}
      <Card>
        <Card.Header>
          <div className="h6">Interface Congestion Threshold</div>
        </Card.Header>
        <Card.Body>
          <div className="row m-2">
            <div className="col-md-8 col-sm-6">
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
              <select
                className="custom-select custom-select-sm"
                onChange={(e) => setSelectedSlice(e.target.value)}
                value={selectedSlice}
              >
                <option value="bw-slice">Bandwidth Slice</option>
                <option value="latency-slice">Latency Slice</option>
                <option value="special-slice">Special Slice</option>
              </select>
            </div>
            <div className="col-md-2 col-sm-6">
              <button
                style={{ width: "135px", fontSize: "12px" }}
                onClick={handleFindCongestion}
                className="btn btn-primary float-right"
                disabled={processFindConguest}
              >
                {processFindConguest ? <Spinner animation="grow" size="sm" variant="light" /> : "Find congestions"}
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
      <CongestedLsp congestedLsp={state.congestedLsp} selectedSlice={selectedSlice} action={handleOptimizationDryrun} />
      <OptimizationResult
        optimizeResult={state.optimizeResult}
        dryRunPayload={dryRunPayloadRef.current}
        action={handleOptimizationCommit}
      />
    </>
  );
};

export default LspOptimize;
