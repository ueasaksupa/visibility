import React from "react";

const LinkHover = (props) => {
  const renderAdjSid = (data) => {
    return data.map((adjSid, index) => {
      return (
        <div className="col-md-12" key={index}>
          Adj-sid : <b>{adjSid.label}</b>
          {"   "}
          {adjSid.sidType === "sr-protected-adj-sid" ? "protect" : "unprotect"}
        </div>
      );
    });
  };
  const renderData = (data) => {
    return data.map((link, index) => {
      return (
        <div key={index} style={{ marginBottom: "10px", borderLeft: "3px solid #36B5E5" }}>
          <div className="col-md-12" style={{ fontSize: "1.3rem" }}>
            {`${link.source}`}
            {" <--> "}
            {`${link.target}`}
          </div>
          <div className="col-md-12">
            Metric : <b>{link.igpMetric}</b>
          </div>
          {renderAdjSid(link.adjacencySID)}
        </div>
      );
    });
  };
  let { linkHoverRef, linkAttr } = props;
  let linkData = [];
  if (linkAttr === null) {
    // For virtual link (eg. LSP path). It's not have linkAttr props
    // Must return blank div instead of null to prevent bug when use hover this link before
    return (
      <div style={{ display: "none" }} className="hoverlink" ref={linkHoverRef}>
        no-data
      </div>
    );
  }
  ///////
  for (const aEnd in linkAttr) {
    for (const link of linkAttr[aEnd]) {
      let zEnd = link.target;
      linkData.push({ source: aEnd, target: zEnd, igpMetric: link.igpMetric, adjacencySID: link.adjacencySID });
    }
  }
  return (
    <div style={{ display: "none" }} className="hoverlink" ref={linkHoverRef}>
      {renderData(linkData)}
    </div>
  );
};

export default LinkHover;
