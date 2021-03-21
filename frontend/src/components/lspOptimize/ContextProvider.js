// src/count-context.js
import * as React from "react";
import BACKEND from "../api/pythonBackend";

const LspOptimizeContext = React.createContext();

const initialState = {
  optimizeResult: null,
  congestedLsp: null,
  opHistory: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "updateOptimizeHistory": {
      return { ...state, opHistory: action.payload };
    }
    case "updateOptimizeResult": {
      return { ...state, optimizeResult: action.payload };
    }
    case "updateFindCongestedLsp": {
      return { ...state, congestedLsp: action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function LspOptimizeContextProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <LspOptimizeContext.Provider value={value}>{children}</LspOptimizeContext.Provider>;
}

function useLspOptimizeContext() {
  const context = React.useContext(LspOptimizeContext);
  if (context === undefined) {
    throw new Error("must be used within a ContextProvider");
  }
  return [context.state, context.dispatch];
}

export { LspOptimizeContextProvider, useLspOptimizeContext };
