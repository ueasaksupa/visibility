import React, { Component } from "react";

import _ from "lodash";
/*
README:  topology is rendered by cisco dna-ui
docs: http://dna-ui.cisco.com/
the dependency in package.json @cisco/topology cannot be normally downloaded by npm install.
please read README about how to install dna-ui package
*/
// It's important to include these styles
import "../../fonts/dnac-icon/style.css";
import "../../fonts/CiscoSans/style.css";
import Topology from "@cisco/topology";
import { TOPO_CONTRIBS, TOPO_PROPS, customPathStyle } from "./topologySetup";
import LinkHover from "./LinkHover";
import HiddenPannel from "../HiddenPannel";
import NodeDetail from "./NodeDetail";

class TopologyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { linkAttr: null, selectedNode: null };
    this.linkHoverRef = React.createRef();
    this.topologyRef = React.createRef();
    this.mainTopology = new Topology();
    this.prefixToNodeMapper = {};
    this.labelToNodeMapper = {};
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

  showSidebar = () => {
    const sidebar = document.getElementsByClassName("hidden-pannel")[0];
    sidebar.style.transform = "translateX(0px)";
  };
  hideSidebar = () => {
    const sidebar = document.getElementsByClassName("hidden-pannel")[0];
    sidebar.style.transform = "translateX(100%)";
  };

  findNodeFromLinkAddr(addr) {
    let { topologyData } = this.props;
    for (let node in topologyData) {
      for (let link of topologyData[node].links) {
        if (link.localAddress === addr) {
          return { source: node, target: link.target };
        }
      }
    }
    return null;
  }

  getReroutedPath() {
    let links = [];
    let path = this.props.reroutedPath;
    let topologyData = this.props.topologyData;
    console.log(path);
    console.log(topologyData);

    // render re-routed path
    console.log("preparing re-routed-opt-path");
    for (let index = 0; index < path["re-routed-opt-path"].hop.length; index++) {
      let link = this.findNodeFromLinkAddr(path["re-routed-opt-path"].hop[index]["ip-address"]);
      if (link === null) continue;
      console.log("src:", link.source, " target:", link.target);
      links.push({
        source: topologyData[link.source].id,
        target: topologyData[link.target].id,
        customParam: { thickness: 6, color: "#52BE80", path: customPathStyle },
        attr: null,
      });
    }

    // render original path
    console.log("preparing original-path");
    for (let index = 0; index < path["original-path"].hop.length; index++) {
      let link = this.findNodeFromLinkAddr(path["original-path"].hop[index]["ip-address"]);
      if (link === null) continue;
      console.log("src:", link.source, " target:", link.target);
      links.push({
        source: topologyData[link.source].id,
        target: topologyData[link.target].id,
        customParam: { thickness: 6, color: "#FFC300", path: customPathStyle },
        attr: null,
      });
    }
    return links;
  }

  getLspPathTopologyData() {
    let sourceAddress = this.props.selectedLsp.peerAddress;
    let lspPathList = this.props.selectedLsp.path;
    let pathLinks = [];

    let sourceNodeId = this.prefixToNodeMapper[sourceAddress].id;
    let sourceNodeName = this.prefixToNodeMapper[sourceAddress].nodename;
    let destNodeId = null;
    let destNodeName = null;
    for (const label of lspPathList) {
      console.log("current label: ", label);
      try {
        if (label in this.labelToNodeMapper) {
          console.log("source: ", sourceNodeName);
          let dashed;
          if (this.labelToNodeMapper[label].type === "adjacency-sid") {
            //for Adj SID
            destNodeId = this.labelToNodeMapper[label][sourceNodeName].id;
            destNodeName = this.labelToNodeMapper[label][sourceNodeName].nodename;
            dashed = null;
          } else if (this.labelToNodeMapper[label].type === "prefix-sid") {
            //for Prefix SID
            destNodeId = this.labelToNodeMapper[label].id;
            destNodeName = this.labelToNodeMapper[label].nodename;
            dashed = [10, 6];
          }
          if (destNodeId !== null) {
            pathLinks.push({
              source: sourceNodeId,
              target: destNodeId,
              customParam: { dashed, thickness: 6, color: "#52BE80", path: customPathStyle },
              attr: null,
            });
            console.log("Path Added ", {
              source: sourceNodeId,
              target: destNodeId,
              customParam: { dashed, thickness: 6, color: "#52BE80", path: customPathStyle },
              attr: null,
            });
            console.log(sourceNodeName, "=>", destNodeName);
          }
        } else {
          console.log("label not found: ", label);
          if (pathLinks.length > 0) {
            pathLinks[pathLinks.length - 1].customParam.color = "#F1C40F";
          }
          break;
        }
      } catch {
        console.log(pathLinks);
        if (pathLinks.length > 0) {
          pathLinks[pathLinks.length - 1].customParam.color = "#F1C40F";
        }
        break;
      }
      sourceNodeId = destNodeId;
      sourceNodeName = destNodeName;
    }

    return pathLinks;
  }

  getJsonTopologyData() {
    let locationMapper = {
      AGG1_UPE1: { x: 10, y: 10 },
      AGG2_UPE2: { x: 14, y: 10 },
      AGG3_NPE1: { x: 10, y: 7 },
      AGG4_NPE2: { x: 14, y: 7 },
      "SR-PCE1": { x: 10, y: 4 },
      "SR-PCE2": { x: 14, y: 4 },
      "ncs540-1": { x: 7, y: 10 },
      "ncs540-2": { x: 7, y: 13 },
      "ncs540-3": { x: 7, y: 16 },
      "ncs540-4": { x: 10, y: 16 },
      "ncs540-5": { x: 14, y: 16 },
      "ncs540-6": { x: 16, y: 13 },
      "ncs540-7": { x: 19, y: 13 },
      "0000.0003.0008": { x: 19, y: 9 },
      "ncs540-8": { x: 19, y: 9 },
    };
    let nodes = [];
    let links = [];
    let tmpLink = {};
    if (this.props.selectedLsp !== null && this.props.selectedLsp !== undefined) {
      // for Drawing path when lsp table are selected
      links = this.getLspPathTopologyData();
    } else if (this.props.selectedLsp !== null && this.props.reroutedPath !== undefined) {
      // for Drawing rerouted path
      links = this.getReroutedPath();
    }
    //
    for (const name in this.props.topologyData) {
      // Nodes generation
      nodes.push({
        id: this.props.topologyData[name].id,
        label: name,
        family: name.includes("AGG") ? "AGG" : "ACC",
        customParam: {
          x: locationMapper[name].x,
          y: locationMapper[name].y,
        },
      });
      // Links preparation
      this.props.topologyData[name].links.forEach((link) => {
        let uniqLinkID = link.target < name ? link.target + "_" + name : name + "_" + link.target;
        if (!(uniqLinkID in tmpLink)) {
          tmpLink[uniqLinkID] = {
            source: this.props.topologyData[name].id,
            target: this.props.topologyData[link.target].id,
            customParam: {
              thickness: 2,
              // color: linkColor,
              path: customPathStyle,
            },
            attr: { [name]: [{ ...link }] },
          };
        } else {
          if (name in tmpLink[uniqLinkID].attr) {
            tmpLink[uniqLinkID].attr[name].push({ ...link });
          } else {
            tmpLink[uniqLinkID].attr[name] = [{ ...link }];
          }
        }
      });
      //
    }
    console.log(tmpLink);
    // Link generation
    for (const linkId in tmpLink) {
      links.push({ ...tmpLink[linkId] });
    }
    console.log(links);
    return [nodes, links];
  }

  renderTopology() {
    const TOPO_DATA = {
      response: { nodes: [], links: [] },
    };
    let [nodes, links] = this.getJsonTopologyData();
    TOPO_DATA.response.nodes = [...nodes];
    TOPO_DATA.response.links = [...links];

    // Setting topology props to render in div id "topology"
    TOPO_PROPS.applyTo = document.getElementById("topology");
    const MOD_TOPO_PROPS = _.cloneDeep(TOPO_PROPS);
    MOD_TOPO_PROPS.disableNodeClick = this.props.disableNodeClick;
    MOD_TOPO_PROPS.disableLinkHover = this.props.disableLinkHover;
    this.mainTopology.init(MOD_TOPO_PROPS, TOPO_DATA, TOPO_CONTRIBS);
    const util = this.mainTopology.util;
    const topologyAspect = this.mainTopology.aspect;

    util.isReady().then((response) => {
      const nodesData = util.getNodesData();
      // console.log(nodesData);
      topologyAspect.after("onNodesSelect", (nodes) => {
        // console.log(nodes);
        if (nodes && nodes[0]) {
          const nodeId = nodes[0];
          const node = nodesData[nodeId];
          this.setState({ selectedNode: this.props.topologyData[node.label] });
          this.showSidebar();
        } else {
          this.setState({ selectedNode: null });
          this.hideSidebar();
        }
      });
      topologyAspect.after("onLinkSelect", (links) => {
        console.log("selectedLink: ", links);
      });
      topologyAspect.after("onLinkHover", (link, aggregatedLinks, mouseCoord) => {
        // console.log(mouseCoord);
        // console.log(link);
        if (mouseCoord !== undefined && link.attr !== null) {
          let hoverShowTop, hoverShowLeft;
          this.setState({ linkAttr: link.attr });
          this.linkHoverRef.current.style.display = "block";
          if (mouseCoord.y + this.linkHoverRef.current.offsetHeight > this.topologyRef.current.offsetHeight) {
            hoverShowTop =
              mouseCoord.y - (mouseCoord.y + this.linkHoverRef.current.offsetHeight - this.topologyRef.current.offsetHeight);
          } else {
            hoverShowTop = mouseCoord.y;
          }
          if (mouseCoord.x + this.linkHoverRef.current.offsetWidth > this.topologyRef.current.offsetWidth) {
            hoverShowLeft = mouseCoord.x - this.linkHoverRef.current.offsetWidth - 15;
          } else {
            hoverShowLeft = mouseCoord.x + 35;
          }
          this.linkHoverRef.current.style.top = `${hoverShowTop}px`;
          this.linkHoverRef.current.style.left = `${hoverShowLeft}px`;
        } else {
          // if mouseCoord is undefined it mean mouse is not hover on link
          this.linkHoverRef.current.style.display = "none";
        }
      });
    });
  }

  componentDidMount() {
    console.log("topology rendered.");
    this._getPrefixToNodeMapper();
    console.log("prefixToNodeMapper: ", this.prefixToNodeMapper);
    console.log("labelToNodeMapper: ", this.labelToNodeMapper);
    this.renderTopology();
  }
  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps, this.props)) {
      console.log("topology update.");
      const topologyUtil = this.mainTopology.util;
      topologyUtil.onTopologyDestroy();
      this.mainTopology = new Topology();
      this.renderTopology();
    }
  }

  render() {
    return (
      <>
        <div id="topology" ref={this.topologyRef}></div>
        <LinkHover linkHoverRef={this.linkHoverRef} linkAttr={this.state.linkAttr} />
        <HiddenPannel>
          <NodeDetail selectedNode={this.state.selectedNode} />
        </HiddenPannel>
      </>
    );
  }
}

export default TopologyComponent;
