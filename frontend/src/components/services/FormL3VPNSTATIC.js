import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";

const FormL3VPNSTATIC = forwardRef((props, ref) => {
  let deviceOption = [<option key="0">-</option>];
  const [devices, setDevices] = useState([]);
  const [intfNumberSelector, setIntfNumberSelector] = useState(null);
  //
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("ACC");
  const [currentIpGW, setCurrentIpGW] = useState("");
  const [currentAccVlan, setCurrentAccVlan] = useState("");
  //
  const [inputCommon, setInputCommon] = useState({
    "service-id": "L3_Static_BG_SP_1511",
    vrf: "L3_Static_BG_SP_1511",
    rt: "100:1511",
    "pe-vlan": 1511,
    "auto-rd": "1511",
    slice: "NPE-ACC-BW",
    "destination-ip": "151.0.1.0/24",
    interface: "HundredGigE0/7/0/4.1511",
    "forward-ip": "17.0.1.2",
    interface1: "HundredGigE0/4/0/6.1511",
    "forward-ip1": "17.0.1.6",
    "destination-ip2": "160.2.1.0/24",
    interface2: "TenGigE0/0/0/16.1511",
    "forward-ip2": "16.2.1.2",
    "bvi-interface": "1511",
    "bvi-ipv4-address": "15.2.1.0/24",
    "bvi-mac-address": "1011.1111.3344",
    evi: "1511",
    "route-target": "3000:1511",
  });

  deviceOption = [
    ...deviceOption,
    props.devices.map((deviceName, index) => {
      return <option key={index + 1}>{deviceName}</option>;
    }),
  ];

  useImperativeHandle(ref, () => ({
    createPayload() {
      const servicesParams = [];
      const payload = {};
      const scale = 1;
      let slice_container =
        inputCommon["slice"].includes("BW") || inputCommon["slice"].includes("LT") ? "NPE-ACC-BW-LT" : inputCommon["slice"];
      for (let i = 0; i < scale; i++) {
        let isSpecialSlice = inputCommon["slice"].includes("SP");
        let payload = {
          "service-id": `${inputCommon["service-id"]}_${i}`,
          "l3vpn-connected-type": inputCommon["slice"],
          "common-param": {
            "pe-vlan": parseInt(inputCommon["pe-vlan"]) + i,
            vrf: `${inputCommon["vrf"]}_${parseInt(inputCommon["pe-vlan"]) + i}`,
            rt: `100:${parseInt(inputCommon["rt"].split(":")[1]) + i}`,
          },
          [slice_container]: {
            devices: [...devices],
            "npe-router-static": {
              "destination-ip": inputCommon["destination-ip"],
              interface: inputCommon["interface"],
              "forward-ip": inputCommon["forward-ip"],
              interface1: inputCommon["interface1"],
              "forward-ip1": inputCommon["forward-ip1"],
            },
            "acc-router-static": {
              "destination-ip2": inputCommon["destination-ip2"],
              interface2: inputCommon["interface2"],
              "forward-ip2": inputCommon["forward-ip2"],
            },
          },
        };
        if (isSpecialSlice) {
          payload[slice_container].BVI = {
            "bvi-interface": inputCommon["bvi-interface"],
            "bvi-ipv4-address": inputCommon["bvi-ipv4-address"],
            "bvi-mac-address": inputCommon["bvi-mac-address"],
          };
          payload[slice_container].evpn = {
            evi: inputCommon["evi"],
            "route-target": inputCommon["route-target"],
          };
        }
        servicesParams.push(payload);
      }
      payload["L3VPNstatic:L3VPNstatic"] = servicesParams;
      return payload;
    },
  }));

  const onDeviceAddHandler = (object, action = "add") => {
    if (action === "add") {
      setDevices([...devices, object]);
    } else if (action === "delete") {
      let tmpDevice = [...devices];
      tmpDevice.splice(object, 1);
      setDevices([...tmpDevice]);
    }
  };

  useEffect(() => {
    // Do fetch new interface id belonging to selected device and interface type
    const fetchInterfaceId = () => {
      if (currentDevice !== "-" && currentIntfType) {
        NSO_API.get(
          `restconf/data/tailf-ncs:devices/device=${currentDevice}/config/tailf-ned-cisco-ios-xr:interface/${currentIntfType}`,
        ).then((response) => {
          console.log("1: ", response);
          if (response.status === 200) {
            setIntfNumberSelector([
              <option key="0">-</option>,
              ...response.data[`tailf-ned-cisco-ios-xr:${currentIntfType}`].map((ele, index) => {
                return <option key={index + 1}>{ele.id}</option>;
              }),
            ]);
          } else {
            setIntfNumberSelector(null);
          }
        });
      }
    };
    //
    fetchInterfaceId();
  }, [currentDevice, currentIntfType]);

  const renderDeviceTableBody = () => {
    if (devices.length !== 0) {
      return devices.map((row, index) => {
        return (
          <tr key={index}>
            <td>{row["device-type"]}</td>
            <td>{row.device}</td>
            <td>
              {row["interface-type"]} {row[`${row["interface-type"]}-id`]}
            </td>
            <td>{row["pe-ipv4-gw"]}</td>
            <td>{row["acc_vlan"]}</td>
            <td>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onDeviceAddHandler(index, "delete");
                }}
              >
                <i className="fas fa-trash-alt" />
              </button>
            </td>
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            no data
          </td>
        </tr>
      );
    }
  };

  return (
    <>
      <div>Common Values</div>
      <Form.Row>
        <Form.Group as={Col} controlId="service-id">
          <Form.Label>Service name</Form.Label>
          <Form.Control
            required
            size="sm"
            type="text"
            placeholder="service name"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="pe-vlan">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            size="sm"
            type="text"
            placeholder="vlan number"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["pe-vlan"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="rt">
          <Form.Label>RT</Form.Label>
          <Form.Control
            size="sm"
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["rt"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="vrf">
          <Form.Label>
            VRF<small className="mx-2">(Automatically append VLAN number)</small>
          </Form.Label>
          <Form.Control
            size="sm"
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["vrf"]}
          />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="3" controlId="slice">
          <Form.Label>Slice</Form.Label>
          <Form.Control
            size="sm"
            as="select"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["slice"]}
          >
            <option value="NPE-ACC-BW">Bandwidth</option>
            <option value="NPE-ACC-LT">Latency</option>
            <option value="NPE-ACC-SP">Special</option>
          </Form.Control>
        </Form.Group>
      </Form.Row>
      <div>NPE Router-Static Configuration</div>
      <div className="border rounded p-2 mb-2">
        <Form.Row>
          <Form.Group as={Col} md="2" controlId="destination-ip" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="destination-ip"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["destination-ip"]}
            />
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="interface" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="Interface NPE1"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["interface"]}
            />
          </Form.Group>
          <Form.Group as={Col} md="2" controlId="forward-ip" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="forward-ip NPE1"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["forward-ip"]}
            />
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="interface1" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="Interface NPE2"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["interface1"]}
            />
          </Form.Group>
          <Form.Group as={Col} md="2" controlId="forward-ip1" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="forward-ip NPE2"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["forward-ip1"]}
            />
          </Form.Group>
        </Form.Row>
      </div>
      <div>Access Router-Static Configuration</div>
      <div className="border rounded p-2 mb-2">
        <Form.Row>
          <Form.Group as={Col} md="2" controlId="destination-ip2" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="destination-ip"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["destination-ip2"]}
            />
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="interface2" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="Interface"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["interface2"]}
            />
          </Form.Group>
          <Form.Group as={Col} md="2" controlId="forward-ip2" className="m-0">
            <Form.Control
              required
              size="sm"
              type="text"
              placeholder="forward-ip"
              onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
              value={inputCommon["forward-ip2"]}
            />
          </Form.Group>
        </Form.Row>
      </div>
      {inputCommon["slice"] === "NPE-ACC-SP" && (
        <div>
          <div>Special Slice Settings</div>
          <div className="border rounded p-2 mb-2">
            <div>BVI</div>
            <Form.Row>
              <Form.Group as={Col} md="2" controlId="bvi-interface" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="bvi-interface"
                  onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
                  value={inputCommon["bvi-interface"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="bvi-ipv4-address" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="bvi-ipv4-address"
                  onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
                  value={inputCommon["bvi-ipv4-address"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="2" controlId="bvi-mac-address" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="bvi-mac-address"
                  onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
                  value={inputCommon["bvi-mac-address"]}
                />
              </Form.Group>
            </Form.Row>
            <div>EVPN</div>
            <Form.Row>
              <Form.Group as={Col} md="2" controlId="evi" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="evi"
                  onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
                  value={inputCommon["evi"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="route-target" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="route-target"
                  onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
                  value={inputCommon["route-target"]}
                />
              </Form.Group>
            </Form.Row>
          </div>
        </div>
      )}
      {/*  */}
      <div>Devices</div>
      <Form.Row>
        <Form.Group as={Col} md="1" controlId="device-type">
          <Form.Label>DeviceType</Form.Label>
          <Form.Control size="sm" as="select" onChange={(e) => setCurrentDeviceType(e.target.value)} value={currentDeviceType}>
            <option>ACC</option>
            <option>UPE1</option>
            <option>UPE2</option>
            <option>NPE1</option>
            <option>NPE2</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="2" controlId="device">
          <Form.Label>Device</Form.Label>
          <Form.Control
            size="sm"
            as="select"
            onChange={(e) => {
              setCurrentDevice(e.target.value);
            }}
            value={currentDevice}
          >
            {deviceOption}
          </Form.Control>
        </Form.Group>
        {!currentDeviceType.includes("UPE") && (
          <Form.Group as={Col} md="2" controlId="intfType">
            <Form.Label>Interface</Form.Label>
            <Form.Control
              size="sm"
              as="select"
              onChange={(e) => {
                setCurrentIntfType(e.target.value);
              }}
              value={currentIntfType}
            >
              <option>GigabitEthernet</option>
              <option>Bundle-Ether</option>
              <option>TenGigE</option>
              <option>HundredGigE</option>
            </Form.Control>
          </Form.Group>
        )}
        {!currentDeviceType.includes("UPE") && (
          <Form.Group as={Col} md="2" controlId="intfNumber">
            <Form.Label>Number</Form.Label>
            <Form.Control size="sm" as="select" onChange={(e) => setCurrentIntfNumber(e.target.value)} value={currentIntfNumber}>
              {intfNumberSelector ? intfNumberSelector : <option>-</option>}
            </Form.Control>
          </Form.Group>
        )}
        {(!inputCommon["slice"].includes("SP") && !currentDeviceType.includes("UPE")) ||
        (inputCommon["slice"].includes("SP") && currentDeviceType.includes("ACC")) ? (
          <Form.Group as={Col} md="2" controlId="pe-ipv4-gw">
            <Form.Label>IPv4 Gateway</Form.Label>
            <Form.Control
              size="sm"
              required
              type="text"
              placeholder="0.0.0.0/30"
              onChange={(e) => setCurrentIpGW(e.target.value)}
              value={currentIpGW}
            />
          </Form.Group>
        ) : (
          ""
        )}
        {currentDeviceType === "ACC" && (
          <Form.Group as={Col} md="2" controlId="acc_vlan">
            <Form.Label>Access Vlan</Form.Label>
            <Form.Control
              size="sm"
              required
              type="text"
              onChange={(e) => setCurrentAccVlan(e.target.value)}
              value={currentAccVlan}
            />
          </Form.Group>
        )}
        <button
          style={{ marginTop: "30px" }}
          className="bg-blue btn btn-primary btn-sm mb-3"
          onClick={(e) => {
            e.preventDefault();
            if (currentDeviceType === "ACC") {
              onDeviceAddHandler({
                "device-type": currentDeviceType,
                device: currentDevice,
                "interface-type": currentIntfType,
                [`${currentIntfType}-id`]: currentIntfNumber,
                "pe-ipv4-gw": currentIpGW,
                acc_vlan: currentAccVlan,
              });
            } else if (currentDeviceType.includes("NPE")) {
              let deviceObject = {
                "device-type": currentDeviceType,
                device: currentDevice,
                "interface-type": currentIntfType,
                [`${currentIntfType}-id`]: currentIntfNumber,
              };
              if (!inputCommon["slice"].includes("SP")) {
                deviceObject["pe-ipv4-gw"] = currentIpGW;
              }
              onDeviceAddHandler(deviceObject);
            } else if (currentDeviceType.includes("UPE")) {
              onDeviceAddHandler({
                "device-type": currentDeviceType,
                device: currentDevice,
              });
            }
          }}
        >
          <i className="fas fa-plus" />
        </button>
      </Form.Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>type</th>
            <th>DeviceName</th>
            <th>Interface</th>
            <th>Gateway</th>
            <th>Vlan</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderDeviceTableBody()}</tbody>
      </Table>
    </>
  );
});

export default FormL3VPNSTATIC;
