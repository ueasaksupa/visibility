from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from datetime import timedelta
import pytz,time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
cors = CORS(app)


##########
# SERVICES
##################################################################################
# GET ALL SERVICE
@app.route('/restconf/data/cisco-wae:networks/network=ais_bw_slice_final/opm/sr-fetch-congestion:sr-fetch-congestion/run/', methods=['POST'])
def fetch_congestion():
    print(request.json)
    time.sleep(3)
    return jsonify(
{
  "sr-fetch-congestion:output": {
    "congested-lsps": [
      {
        "lspName": "srte_c_10394_ep_3.3.3.3",
        "lspSrcNode": "AGG1_UPE1",
        "lspDstNode": "AGG3_NPE1",
        "activeCandPathPref": "100",
        "traffic": "118.0 Mbps",
        "delay": "0.026 ms",
        "complete-path": {
          "interfaceKeys": [
            {
              "intfSrcNode": "AGG1_UPE1",
              "intfName": "HundredGigE0/0/0/0"
            },
            {
              "intfSrcNode": "AGG2_UPE2",
              "intfName": "Bundle-Ether204"
            },
            {
              "intfSrcNode": "AGG4_NPE2",
              "intfName": "HundredGigE0/0/0/0"
            }
          ]
        },
        "congested-path": {
          "interfaceKeys": [
            {
              "intfSrcNode": "AGG1_UPE1",
              "intfName": "HundredGigE0/0/0/0"
            },
            {
              "intfSrcNode": "AGG4_NPE2",
              "intfName": "HundredGigE0/0/0/0"
            }
          ]
        }
      },
      {
        "lspName": "srte_c_10395_ep_3.3.3.3",
        "lspSrcNode": "AGG1_UPE1",
        "lspDstNode": "AGG3_NPE1",
        "activeCandPathPref": "60",
        "traffic": "100.0 Mbps",
        "delay": "0.020 ms",
        "complete-path": {
          "interfaceKeys": [
            {
              "intfSrcNode": "AGG1_UPE1",
              "intfName": "HundredGigE0/0/0/0"
            },
            {
              "intfSrcNode": "AGG2_UPE2",
              "intfName": "Bundle-Ether204"
            },
            {
              "intfSrcNode": "AGG4_NPE2",
              "intfName": "HundredGigE0/0/0/0"
            }
          ]
        },
        "congested-path": {
          "interfaceKeys": [
            {
              "intfSrcNode": "AGG1_UPE1",
              "intfName": "HundredGigE0/0/0/0"
            },
            {
              "intfSrcNode": "AGG4_NPE2",
              "intfName": "HundredGigE0/0/0/0"
            }
          ]
        }
      }
    ],
    "congested-interfaces": [
      {
        "intfSrcNode": "AGG1_UPE1",
        "intfName": "HundredGigE0/0/0/0",
        "intfDestNode": "AGG2_UPE2",
        "traffic": "50790.0 Mbps",
        "utilization": "50.79 %",
        "capacity": "100000.0 Mbps"
      },
      {
        "intfSrcNode": "AGG4_NPE2",
        "intfName": "HundredGigE0/0/0/0",
        "intfDestNode": "AGG3_NPE1",
        "traffic": "50790.0 Mbps",
        "utilization": "50.79 %",
        "capacity": "100000.0 Mbps"
      }
    ]
  }
}
)

@app.route('/restconf/data/cisco-wae:networks/network=ais_bw_slice_final/opm/hybrid-optimizer:hybrid-optimizer/bandwidth/', methods=['POST'])
def bw_optimizer():
    print(request.json)
    time.sleep(3)
    if request.json["input"]["action-type"] == 'commit':
        returnValue = {
                            "hybrid-optimizer:output": {
                                "bandwidth-optimization-results": {
                                    "num-congested-interfaces-bfr-optimization": "1",
                                    "num-congested-interfaces-aft-optimization": "0",
                                    "max-intf-utilization-bfr-optimization": "52.44 %",
                                    "max-intf-utilization-aft-optimization": "32.44 %",
                                    "num-of-re-routed-lsps": "2",
                                    "num-of-created-lsps": "0",
                                    "num-of-deleted-lsps": "0",
                                    "re-routed-lsps": [
                                        {
                                            "lspName": "srte_c_300_ep_2.2.2.2",
                                            "lspSrcNode": "AGG1_UPE1",
                                            "lspDstNode": "AGG2_UPE2",
                                            "traffic": "1000.0 Mbps",
                                            "delay": "0.3 ms",
                                            "original-path": {
                                                "hop": [
                                                    {
                                                        "step": "1",
                                                        "ip-address": "10.5.12.0",
                                                        "intfSrcNode": "AGG1_UPE1",
                                                        "intfName": "TenGigE0/7/0/24"
                                                    }
                                                ]
                                            },
                                            "re-routed-opt-path": {
                                                "hop": [
                                                    {
                                                        "step": "1",
                                                        "ip-address": "10.5.13.0",
                                                        "intfSrcNode": "AGG1_UPE1",
                                                        "intfName": "TenGigE0/7/0/25"
                                                    },
                                                    {
                                                        "step": "2",
                                                        "ip-address": "10.5.34.1",
                                                        "intfSrcNode": "AGG3_NPE1",
                                                        "intfName": "TenGigE0/9/0/12"
                                                    },
                                                    {
                                                        "step": "3",
                                                        "ip-address": "10.5.24.0",
                                                        "intfSrcNode": "AGG4_NPE2",
                                                        "intfName": "TenGigE0/7/0/13"
                                                    }
                                                ]
                                            },
                                            "prev-delay": "0.1 ms"
                                        }
                                    ],
                                    "result": "LSP Changed Successfully."
                                }
                            }
                        }
    else:
        returnValue =  {
                            "hybrid-optimizer:output": {
                                "bandwidth-optimization-results": {
                                    "num-congested-interfaces-bfr-optimization": "1",
                                    "num-congested-interfaces-aft-optimization": "0",
                                    "max-intf-utilization-bfr-optimization": "52.44 %",
                                    "max-intf-utilization-aft-optimization": "32.44 %",
                                    "num-of-re-routed-lsps": "2",
                                    "num-of-created-lsps": "0",
                                    "num-of-deleted-lsps": "0",
                                    "re-routed-lsps": [
                                        {
                                            "lspName": "srte_c_300_ep_2.2.2.2",
                                            "lspSrcNode": "AGG1_UPE1",
                                            "lspDstNode": "AGG2_UPE2",
                                            "traffic": "1000.0 Mbps",
                                            "delay": "0.3 ms",
                                            "original-path": {
                                                "hop": [
                                                    {
                                                        "step": "1",
                                                        "ip-address": "10.5.12.0",
                                                        "intfSrcNode": "AGG1_UPE1",
                                                        "intfName": "TenGigE0/7/0/24"
                                                    }
                                                ]
                                            },
                                            "re-routed-opt-path": {
                                                "hop": [
                                                    {
                                                        "step": "1",
                                                        "ip-address": "10.5.13.0",
                                                        "intfSrcNode": "AGG1_UPE1",
                                                        "intfName": "TenGigE0/7/0/25"
                                                    },
                                                    {
                                                        "step": "2",
                                                        "ip-address": "10.5.34.1",
                                                        "intfSrcNode": "AGG3_NPE1",
                                                        "intfName": "TenGigE0/9/0/12"
                                                    },
                                                    {
                                                        "step": "3",
                                                        "ip-address": "10.5.24.0",
                                                        "intfSrcNode": "AGG4_NPE2",
                                                        "intfName": "TenGigE0/7/0/13"
                                                    }
                                                ]
                                            },
                                            "prev-delay": "0.1 ms"
                                        }
                                    ],
                                    "result": "config to apply on routers to re-route LSPs"
                                }
                            }
                        }
        
    return jsonify(returnValue)

@app.route('/restconf/data/cisco-wae:networks/network=ais_bw_slice_final/opm/lsps-to-reset:lsps-to-reset/run', methods=['POST'])
def delete_lsp():
    print(request.json)
    time.sleep(3)
    if request.json["input"]["action-type"] == 'commit':
        returnValue = {
          "lsps-to-reset:output": {
            "result": "LSP Changed Successfully."
          }
        }
    else:
        returnValue = {
          "lsps-to-reset:output": {
            "result": "\n! Device Configuration Changes on : AGG1_UPE1 for LSPs :-\ngroup sr-te-128\n segment-routing\n  traffic-eng\n   no segment-list WAE_SIDLIST_10001_70\n   no segment-list WAE_SIDLIST_10002_70\n   no segment-list WAE_SIDLIST_10003_70\n   policy BW_UPE1-NPE1_1\n    candidate-paths\n     no preference 70\n    !\n   !\n   policy BW_UPE1-NPE1_2\n    candidate-paths\n     no preference 70\n    !\n   !\n   policy BW_UPE1-NPE1_3\n    candidate-paths\n     no preference 70\n    !\n   !\n  !\n !\n end-group\n!\n\n"
          }
        }
    return jsonify(returnValue)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)