import React from "react";
import Table from "react-bootstrap/Table";

const NodeDetail = (props) => {
  const { selectedNode } = props;
  const renderTableBody = () => {
    return selectedNode.prefixSID.map((ele, index) => {
      return (
        <tr key={index}>
          <td>{ele.label}</td>
          <td>{ele.domain}</td>
          <td>{ele.prefix}</td>
          <td>{ele.algorithm}</td>
        </tr>
      );
    });
  };

  if (selectedNode) {
    const nodename = selectedNode.nodename;
    return (
      <div>
        <div className="h2 pt-4 pb-3">{nodename}</div>
        <div className="h5">Prefix SID</div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Label</th>
              <th>Domain</th>
              <th>Prefix</th>
              <th>Algorithm</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </Table>
      </div>
    );
  } else {
    return null;
  }
};

export default NodeDetail;
