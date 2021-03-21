import React from "react";
import LspOptimize from "./LspOptimize";
import OptimizationHistory from "./OptimazationHistory";
import { LspOptimizeContextProvider } from "./ContextProvider";

const Main = (props) => {
  return (
    <LspOptimizeContextProvider>
      <div className="d-flex pb-3 h-100 w-100">
        <div className="col-md-4 overflow-auto">
          <OptimizationHistory />
        </div>
        <div className="vertical-seperator"></div>
        <div className="col-md-8 overflow-auto">
          <LspOptimize />
        </div>
      </div>
    </LspOptimizeContextProvider>
  );
};

export default Main;
