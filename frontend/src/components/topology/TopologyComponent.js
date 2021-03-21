import React, { Component } from "react";

import _ from "lodash";

// Cytoscape
import CytoscapeComponent from "react-cytoscapejs";
// LAYOUT
import COSEBilkent from "cytoscape-cose-bilkent";
import Cytoscape from "cytoscape";

import LinkHover from "./LinkHover";
import HiddenPannel from "../HiddenPannel";
import NodeDetail from "./NodeDetail";
//
Cytoscape.use(COSEBilkent);
//

class TopologyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { linkAttr: null, selectedNode: null };
    this.linkHoverRef = React.createRef();
    this.topologyRef = React.createRef();
    this.prefixToNodeMapper = {};
    this.labelToNodeMapper = {};
    this.TOPOLOGY_STYLESHEET = [
      {
        selector: "node.srpce",
        style: {
          shape: "round-rectangle",
          width: "17px",
          height: "17px",
          "border-width": "1px",
          "border-color": "#007cad",
          "background-color": "#a8dadc",
        },
      },
      {
        selector: "node.agg",
        style: {
          width: "25px",
          height: "25px",
          "border-width": "2px",
          "border-color": "#007cad",
          "background-color": "#1d3557",
        },
      },
      {
        selector: "node.acc",
        style: {
          shape: "round-rectangle",
          width: "17px",
          height: "17px",
          "background-color": "#eaeaea",
          "border-width": "1px",
          "border-color": "#007cad",
        },
      },
      {
        selector: "node[label]",
        style: {
          label: "data(label)",
          "font-size": "12px",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "curve-style": "bezier",
          "line-color": "#007cad",
        },
      },
      {
        selector: "edge[label]",
        style: {
          label: "data(label)",
          "font-size": "12px",
        },
      },
      {
        selector: "edge.pathTrace-D",
        style: {
          width: 3,
          "curve-style": "bezier",
          "line-color": "#e63946",
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#e63946",
          "source-endpoint": "outside-to-node-or-label",
          "target-endpoint": "outside-to-node-or-label",
        },
      },
      {
        selector: "edge.pathTrace-U",
        style: {
          width: 3,
          "curve-style": "bezier",
          "line-color": "#80b918",
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#80b918",
          "source-endpoint": "outside-to-node-or-label",
          "target-endpoint": "outside-to-node-or-label",
        },
      },
    ];
  }

  _getPrefixToNodeMapper() {
    for (const nodename in this.props.topologyData) {
      for (const prefix of this.props.topologyData[nodename].prefixSID) {
        this.labelToNodeMapper[prefix.label] = { nodename, id: this.props.topologyData[nodename].id, type: "prefix-sid" };
        this.prefixToNodeMapper[prefix.prefix] = { nodename, id: this.props.topologyData[nodename].id };
      }
      for (const link of this.props.topologyData[nodename].links) {
        let target = link.target;
        for (const adjSid of link.adjacencySID) {
          if (adjSid.label in this.labelToNodeMapper) {
            this.labelToNodeMapper[adjSid.label][nodename] = { nodename: target, id: this.props.topologyData[target].id };
          } else {
            this.labelToNodeMapper[adjSid.label] = {
              type: "adjacency-sid",
              [nodename]: { nodename: target, id: this.props.topologyData[target].id },
            };
          }
        }
      }
    }
  }

  // showSidebar = () => {
  //   const sidebar = document.getElementsByClassName("hidden-pannel")[0];
  //   sidebar.style.transform = "translateX(0px)";
  // };
  // hideSidebar = () => {
  //   const sidebar = document.getElementsByClassName("hidden-pannel")[0];
  //   sidebar.style.transform = "translateX(100%)";
  // };

  normalizeTopologyData = (topologyData) => {
    // let locationMapper = {
    //   AGG1_UPE1: { x: 10, y: 10 },
    //   AGG2_UPE2: { x: 14, y: 10 },
    //   AGG3_NPE1: { x: 10, y: 7 },
    //   AGG4_NPE2: { x: 14, y: 7 },
    //   "SR-PCE1": { x: 10, y: 4 },
    //   "SR-PCE2": { x: 14, y: 4 },
    //   "ncs540-1": { x: 7, y: 10 },
    //   "ncs540-2": { x: 7, y: 13 },
    //   "ncs540-3": { x: 7, y: 16 },
    //   "ncs540-4": { x: 10, y: 16 },
    //   "ncs540-5": { x: 14, y: 16 },
    //   "ncs540-6": { x: 16, y: 13 },
    //   "ncs540-7": { x: 19, y: 13 },
    //   "0000.0003.0008": { x: 19, y: 9 },
    //   "ncs540-8": { x: 19, y: 9 },
    // };
    let uniqLinkMap = {};
    let topologyElements = [];
    let nodeFound = {};

    for (let nodename in topologyData) {
      topologyElements.push({
        data: { id: nodename, label: nodename },
        classes: [nodename.includes("AGG") ? "agg" : nodename.includes("PCE") ? "srpce" : "acc"],
      });
      nodeFound[nodename] = true;
      // Links preparation
      topologyData[nodename].links.forEach((link) => {
        let uniqLinkID = link.target < nodename ? link.target + "_" + nodename : nodename + "_" + link.target;
        if (!(uniqLinkID in uniqLinkMap)) {
          uniqLinkMap[uniqLinkID] = {
            source: nodename,
            target: link.target,
          };
        }
      });
    }
    for (const linkId in uniqLinkMap) {
      if (nodeFound[uniqLinkMap[linkId].source] && nodeFound[uniqLinkMap[linkId].target]) {
        topologyElements.push({ data: { source: uniqLinkMap[linkId].source, target: uniqLinkMap[linkId].target } });
      } else {
        console.log(
          "ERROR LINK",
          uniqLinkMap[linkId].source,
          uniqLinkMap[linkId].target,
          nodeFound[uniqLinkMap[linkId].source],
          nodeFound[uniqLinkMap[linkId].target],
        );
      }
    }

    // for pathTrace, will be render path trace when prefixToNodeMapper complete
    if (this.props.selectedLsp && !_.isEmpty(this.prefixToNodeMapper)) {
      let sourceNodeName = this.prefixToNodeMapper[this.props.selectedLsp.source].nodename;
      let destNodeName = null;
      for (const label of this.props.selectedLsp.path) {
        let isDown = this.props.selectedLsp.operationalState.includes("down");
        if (label in this.labelToNodeMapper) {
          if (this.labelToNodeMapper[label].type === "adjacency-sid") {
            destNodeName = this.labelToNodeMapper[label][sourceNodeName].nodename;
            topologyElements.push({
              data: { source: sourceNodeName, target: destNodeName, label: "adj-sid" },
              classes: isDown ? "pathTrace-D" : "pathTrace-U",
            });
          } else if (this.labelToNodeMapper[label].type === "prefix-sid") {
            destNodeName = this.labelToNodeMapper[label].nodename;
            topologyElements.push({
              data: { source: sourceNodeName, target: destNodeName, label: "pfx-sid" },
              classes: isDown ? "pathTrace-D" : "pathTrace-U",
            });
          }
          sourceNodeName = destNodeName;
        }
      }
    }
    return topologyElements;
  };

  componentDidMount() {
    console.log("topology rendered.");
    this._getPrefixToNodeMapper();
    console.log("prefixToNodeMapper: ", this.prefixToNodeMapper);
    console.log("labelToNodeMapper: ", this.labelToNodeMapper);

    this.cy.ready(() => {
      console.log("topology ready: auto layout running...");
      // setUpEventListeners();
      let layout = this.cy.elements().layout({
        name: "cose-bilkent",
        idealEdgeLength: 100,
        fit: true,
        padding: 50,
        quality: "proof",
        animate: false,
      });
      layout.run();
      console.log("topology ready: auto layout done.");
    });
  }

  render() {
    return (
      <>
        <CytoscapeComponent
          elements={this.normalizeTopologyData(this.props.topologyData)}
          style={{ width: "100%", height: "100%" }}
          cy={(cy) => {
            this.cy = cy;
          }}
          stylesheet={this.TOPOLOGY_STYLESHEET}
        />
        <LinkHover linkHoverRef={this.linkHoverRef} linkAttr={this.state.linkAttr} />
        <HiddenPannel>
          <NodeDetail selectedNode={this.state.selectedNode} />
        </HiddenPannel>
      </>
    );
  }
}

export default TopologyComponent;
