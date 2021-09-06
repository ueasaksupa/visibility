class xtcExtractor {
  _getFieldValue(f) {
    if ("uint32_value" in f) {
      return f.uint32_value;
    } else if ("string_value" in f) {
      return f.string_value;
    } else if ("uint64_value" in f) {
      return f.uint64_value;
    }
  }
  _getNodeId(f) {
    return this._getFieldValue(f);
  }
  _getNodeName(f) {
    let nodename;
    f.fields.forEach((field) => {
      if (field.name === "node-name") {
        nodename = this._getFieldValue(field);
      }
    });
    return nodename;
  }
  _getValueOfField(f, name) {
    for (const field of f.fields) {
      if (field.name === name) {
        return this._getFieldValue(field);
      }
    }
  }
  _getLspPath(f) {
    let path = [];
    f.fields.forEach((field) => {
      if (field.name === "reported-sr-path") {
        path.push(this._getValueOfField(field, "mpls-label"));
      }
    });
    return path;
  }
  _getLinkInfo(f) {
    let obj = { adjacencySID: [] };

    f.fields.forEach((field) => {
      if (field.name === "remote-node-protocol-identifier") {
        obj.target = this._getFieldValue(field.fields[0]);
      } else if (field.name === "local-ipv4-address") {
        obj.localAddress = this._getFieldValue(field);
      } else if (field.name === "remote-ipv4-address") {
        obj.remoteAddress = this._getFieldValue(field);
      } else if (field.name === "igp-metric") {
        obj.igpMetric = this._getFieldValue(field);
      } else if (field.name === "adjacency-sids") {
        let sidType, label;
        field.fields.forEach((adjSidField) => {
          if (adjSidField.name === "sid-type") {
            sidType = this._getFieldValue(adjSidField);
          } else if (adjSidField.name === "mpls-label") {
            label = this._getFieldValue(adjSidField);
          }
        });
        obj.adjacencySID.push({ sidType, label });
      }
    });
    return obj;
  }
  _getPrefixSidInfo(f) {
    let obj = {};
    f.fields.forEach((field) => {
      if (field.name === "mpls-label") {
        obj.label = this._getFieldValue(field);
      } else if (field.name === "domain-identifier") {
        obj.domain = this._getFieldValue(field);
      } else if (field.name === "algorithm") {
        obj.algorithm = this._getFieldValue(field);
      } else if (field.name === "sid-prefix") {
        obj.prefix = this._getFieldValue(field.fields[1]);
      }
    });
    return obj;
  }

  getTopologyObject(topoData) {
    let outputObj = {};
    if (topoData.data_gpbkv) {
      topoData.data_gpbkv.forEach((node) => {
        let nodeId, nodename;
        let links = [];
        let prefixSID = [];
        if (node.fields) {
          node.fields.forEach((field) => {
            if (field.name === "content") {
              field.fields.forEach((contendField) => {
                if (contendField.name === "node-identifier") {
                  nodeId = this._getNodeId(contendField);
                } else if (contendField.name === "node-protocol-identifier") {
                  nodename = this._getNodeName(contendField);
                } else if (contendField.name === "ipv4-links") {
                  links.push(this._getLinkInfo(contendField));
                } else if (contendField.name === "prefix-sids") {
                  prefixSID.push(this._getPrefixSidInfo(contendField));
                }
              });
            }
          });
          outputObj[nodename] = { nodename, id: nodeId, links, prefixSID };
        }
      });
      console.log("outObjTopo:", outputObj);
      return outputObj;
    } else {
      return undefined;
    }
  }

  getLspObject(lspData) {
    let outputObj = {};
    lspData.data_gpbkv.forEach((lsp) => {
      let lspName, color, source, target, bindingSid, path, preference, operationalState, peerAddress, intfName;
      if (lsp.fields) {
        lsp.fields.forEach((field) => {
          if (field.name === "content") {
            field.fields.forEach((contendField) => {
              if (contendField.name === "tunnel-name") {
                lspName = this._getFieldValue(contendField);
              } else if (contendField.name === "peer-address") {
                peerAddress = this._getFieldValue(contendField);
              } else if (contendField.name === "color") {
                color = this._getFieldValue(contendField);
              } else if (contendField.name === "interface-name") {
                intfName = this._getFieldValue(contendField);
              } else if (contendField.name === "detail-lsp-information") {
                contendField.fields.forEach((field) => {
                  if (field.name === "brief-lsp-information") {
                    source = this._getValueOfField(field, "source-address");
                    target = this._getValueOfField(field, "destination-address");
                    bindingSid = this._getValueOfField(field, "binding-sid");
                    operationalState = this._getValueOfField(field, "operational-state");
                  } else if (field.name === "er-os") {
                    path = this._getLspPath(field);
                  } else if (field.name === "eros") {
                    path = this._getLspPath(field);
                  } else if (field.name === "preference") {
                    preference = this._getFieldValue(field);
                  }
                });
              }
            });
          }
        });
        outputObj[lspName] = {
          operationalState,
          lspName,
          color,
          intfName,
          source,
          target,
          bindingSid,
          path,
          preference,
          peerAddress,
        };
      }
    });
    console.log("outObjLsp:", outputObj);
    return outputObj;
  }
}

export default xtcExtractor;
