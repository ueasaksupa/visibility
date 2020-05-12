import { nodeStyle } from "./icon";

export const TOPO_CONTRIBS = [];

export const TOPO_PROPS = {
  id: "basic-nodes",
  applyTo: null, // this need to be overide with acutal document.getElementById("....")
  zoomToFit: true,
  multilineLabels: true,
  nodeAppearance: { ...nodeStyle },
  disableCanvasDragV: true,
  disableCanvasDragH: true,
  disableNodeDrag: true,
  disableLinkClick: false,
  disableNodeClick: false,
  disableLinkHover: false,
  disableZoom: true,
  lockBounds: true,
  autoBezier: true,
};

export const INIT_TOPO_DATA = {
  response: {
    nodes: [],
    links: [],
  },
};

export const customPathStyle = {
  persistOnAdjust: true,
  default: {
    control: 0,
    x1: 0,
    y1: 0,
    cp1x: 0,
    cp1y: 0,
    cp2x: 0,
    cp2y: 0,
    x2: 0,
    y2: 0,
  },
  left: {
    control: 0,
    x1: 0,
    y1: 0,
    cp1x: 0,
    cp1y: 0,
    cp2x: 0,
    cp2y: 0,
    x2: 0,
    y2: 0,
  },
  right: {
    control: 0,
    x1: 0,
    y1: 0,
    cp1x: 0,
    cp1y: 0,
    cp2x: 0,
    cp2y: 0,
    x2: 0,
    y2: 0,
  },
  below: {
    control: 0,
    x1: 0,
    y1: 0,
    cp1x: 0,
    cp1y: 0,
    cp2x: 0,
    cp2y: 0,
    x2: 0,
    y2: 0,
  },
  above: {
    control: 0,
    x1: 0,
    y1: 0,
    cp1x: 0,
    cp1y: 0,
    cp2x: 0,
    cp2y: 0,
    x2: 0,
    y2: 0,
  },
};
