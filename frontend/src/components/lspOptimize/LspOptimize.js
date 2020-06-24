import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import CongestedLsp from "./CongestedLsp";

import { WAE_API } from "../api/apiBackend";
import xtcExtractor from "../api/xtcExtractor";
import { SR_PCE_API } from "../api/apiBackend";

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
    let payload = { input: { "interface-utilization": congestionThresHold, "perform-opt-on": "bw-slice" } };
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
                {procFindCong ? <Spinner animation="grow" size="sm" variant="light" /> : "Find congestions"}
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
