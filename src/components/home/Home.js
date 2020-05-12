import React, { useState, useEffect } from "react";

import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";

import TopologyComponent from "../topology/TopologyComponent";
import LspDetails from "./LspDetails";
import xtcExtractor from "../api/xtcExtractor";
import { SR_PCE_API } from "../api/apiBackend";

const Home = (props) => {
  document.title = "HOME";
  const [leftPanelWidth, setleftPanelWidth] = useState(50);
  const [rightPanelWidth, setrightPanelWidth] = useState(50);

  const [topologyData, setTopologyData] = useState(null);
  const [selectedLsp, setSelectedLsp] = useState(null);

  const onLspTableClick = (lsp) => {
    setSelectedLsp(lsp);
  };

  const fetchData = async () => {
    let topoR = await SR_PCE_API.get("/topo/subscribe/txt");
    let extractor = new xtcExtractor();
    setTopologyData(extractor.getTopologyObject(topoR.data));
  };

  const onRefreshButton = () => {
    setTopologyData(null);
    fetchData();
  };

  const expandLeftHandler = () => {
    if (leftPanelWidth - 50 >= 0) {
      setrightPanelWidth(rightPanelWidth + 50);
      setleftPanelWidth(leftPanelWidth - 47);
    }
  };
  const expandRightHandler = () => {
    if (rightPanelWidth - 50 >= 0) {
      setrightPanelWidth(rightPanelWidth - 50);
      setleftPanelWidth(leftPanelWidth + 47);
    }
  };

  const reSizeHandler = () => {
    // console.log(window.innerWidth);
    if (window.innerWidth < 768) {
      setrightPanelWidth(100);
      setleftPanelWidth(100);
    } else {
      setrightPanelWidth(50);
      setleftPanelWidth(50);
    }
  };

  useEffect(() => {
    // ComponentDidMount
    fetchData();
    window.addEventListener("resize", reSizeHandler);
    return () => {
      // ComponentWillUnmount
      window.removeEventListener("resize", reSizeHandler);
    };
  }, []);

  let TopoCompoennt;
  if (topologyData === null) {
    TopoCompoennt = (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  } else if (topologyData === undefined) {
    TopoCompoennt = <div className="text-center mt-5">ERROR</div>;
  } else {
    TopoCompoennt = (
      <>
        <Card className="h-100">
          <Card.Header>
            <div className="d-flex">
              <div className="mr-4">Topology Diagram</div>
              <div>
                <button onClick={onRefreshButton} className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-sync-alt buttonize"></i>
                </button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <TopologyComponent topologyData={topologyData} selectedLsp={selectedLsp} />
          </Card.Body>
        </Card>
      </>
    );
  }
  return (
    <div className="h-100 w-100 d-md-flex px-md-2 px-sm-3 position-relative">
      <div className="content-panel-left h-100 mb-sm-2 mb-md-0" style={{ width: `${leftPanelWidth}%` }}>
        {TopoCompoennt}
      </div>
      {/* SEPARATOR */}
      <div className="d-sm-none d-md-flex separator-btn">
        <div onClick={expandLeftHandler} className="separator-btn-arrow">
          <i className="fa fa-angle-left" />
        </div>
        <div onClick={expandRightHandler} className="separator-btn-arrow">
          <i className="fa fa-angle-right" />
        </div>
      </div>
      {/* SEPARATOR */}
      <div className="content-panel-right mb-sm-2 mb-md-0" style={{ width: `${rightPanelWidth}%` }}>
        <LspDetails onLspTableClick={onLspTableClick} />
      </div>
    </div>
  );
};

export default Home;
