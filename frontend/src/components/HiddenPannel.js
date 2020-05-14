import React from "react";
import ReactDOM from "react-dom";

const HiddenPannel = props => {
  return ReactDOM.createPortal(<div className="hidden-pannel">{props.children}</div>, document.getElementById("hidden-pannel"));
};

export default HiddenPannel;
