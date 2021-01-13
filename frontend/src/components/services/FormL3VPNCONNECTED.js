import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";
import FormL3VPNBGP from "./FormL3VPNBGP";

const FormL3VPNCONNECTED = (props) => {
  let deviceOption = [<option key="0">-</option>];
  const [intfNumberSelector1, setIntfNumberSelector1] = useState(null);
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("UPE1");
  const [currentIpGW, setCurrentIpGW] = useState("");
  const [currentAccVlan, setCurrentAccVlan] = useState("");
  const [currentUPEVlan, setCurrentUPEVlan] = useState("");

  deviceOption = [
    ...deviceOption,
    props.devices.map((deviceName, index) => {
      return <option key={index + 1}>{deviceName}</option>;
    }),
  ];

  useEffect(() => {
    // Do fetch new interface id belonging to selected device and interface type
    const fetchInterfaceId = () => {
      if (currentDevice !== "-" && currentIntfType) {
        NSO_API.get(
          `restconf/data/tailf-ncs:devices/device=${currentDevice}/config/tailf-ned-cisco-ios-xr:interface/${currentIntfType}`,
        ).then((response) => {
          console.log("1: ", response);
          if (response.status === 200) {
            setIntfNumberSelector1([
              <option key="0">-</option>,
              ...response.data[`tailf-ned-cisco-ios-xr:${currentIntfType}`].map((ele, index) => {
                return <option key={index + 1}>{ele.id}</option>;
              }),
            ]);
          } else {
            setIntfNumberSelector1(null);
          }
        });
      }
    };
    //
    fetchInterfaceId();
  }, [currentDevice, currentIntfType]);

  const renderDeviceTableBody = () => {
    if (props.inputParams.devices.length !== 0) {
      return props.inputParams.devices.map((row, index) => {
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
                  props.onDeviceAdd(index, "delete");
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

  const deviceAddHandler = (e) => {
    e.preventDefault();
    if (currentDeviceType === "ACC") {
      props.onDeviceAdd({
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
      if (!props.inputParams["slice"].includes("SP")) {
        deviceObject["pe-ipv4-gw"] = currentIpGW;
      }
      props.onDeviceAdd(deviceObject);
    } else if (currentDeviceType.includes("UPE")) {
      let deviceObject = {
        "device-type": currentDeviceType,
        device: currentDevice,
      };
      if (props.inputParams["slice"].includes("NPE-UPE")) {
        deviceObject = {
          ...deviceObject,
          "interface-type": currentIntfType,
          [`${currentIntfType}-id`]: currentIntfNumber,
          "pe-ipv4-gw": currentIpGW,
          upe_vlan: currentUPEVlan,
        };
      }
      props.onDeviceAdd(deviceObject);
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
            onChange={props.onChange}
            value={props.inputParams["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="pe-vlan">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            size="sm"
            type="text"
            placeholder="vlan number"
            onChange={props.onChange}
            value={props.inputParams["pe-vlan"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="rt">
          <Form.Label>RT</Form.Label>
          <Form.Control size="sm" required type="text" onChange={props.onChange} value={props.inputParams["rt"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="auto-rd">
          <Form.Label>Auto RD</Form.Label>
          <Form.Control size="sm" required type="text" onChange={props.onChange} value={props.inputParams["auto-rd"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="vrf">
          <Form.Label>
            VRF<small className="mx-2">(Automatically append VLAN number)</small>
          </Form.Label>
          <Form.Control size="sm" required type="text" onChange={props.onChange} value={props.inputParams["vrf"]} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} md="3" controlId="slice">
          <Form.Label>Slice</Form.Label>
          <Form.Control size="sm" as="select" onChange={props.onChange} value={props.inputParams["slice"]}>
            <option value="NPE-ACC-BW">Bandwidth</option>
            <option value="NPE-ACC-LT">Latency</option>
            <option value="NPE-ACC-SP">Special</option>
            <option value="NPE-UPE">NPE-UPE</option>
          </Form.Control>
        </Form.Group>
      </Form.Row>
      {props.inputParams["slice"] !== "NPE-UPE" && !props.inputParams["slice"].includes("SP") && (
        <>
          <div>NPE Router-Static Configuration</div>
          <div className="border rounded p-2 mb-2">
            <Form.Row>
              <Form.Group as={Col} md="2" controlId="destination-ip" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="destination-ip"
                  onChange={props.onChange}
                  value={props.inputParams["destination-ip"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="interface" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="Interface NPE1"
                  onChange={props.onChange}
                  value={props.inputParams["interface"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="2" controlId="forward-ip" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="forward-ip NPE1"
                  onChange={props.onChange}
                  value={props.inputParams["forward-ip"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="interface1" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="Interface NPE2"
                  onChange={props.onChange}
                  value={props.inputParams["interface1"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="2" controlId="forward-ip1" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="forward-ip NPE2"
                  onChange={props.onChange}
                  value={props.inputParams["forward-ip1"]}
                />
              </Form.Group>
            </Form.Row>
          </div>
        </>
      )}
      {props.inputParams["slice"] === "NPE-ACC-SP" && (
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
                  onChange={props.onChange}
                  value={props.inputParams["bvi-interface"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="bvi-ipv4-address" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="bvi-ipv4-address"
                  onChange={props.onChange}
                  value={props.inputParams["bvi-ipv4-address"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="2" controlId="bvi-mac-address" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="bvi-mac-address"
                  onChange={props.onChange}
                  value={props.inputParams["bvi-mac-address"]}
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
                  onChange={props.onChange}
                  value={props.inputParams["evi"]}
                />
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="route-target" className="m-0">
                <Form.Control
                  required
                  size="sm"
                  type="text"
                  placeholder="route-target"
                  onChange={props.onChange}
                  value={props.inputParams["route-target"]}
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
            <option>UPE1</option>
            <option>UPE2</option>
            <option>NPE1</option>
            <option>NPE2</option>
            {props.inputParams["slice"] !== "NPE-UPE" && <option>ACC</option>}
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
        {(!currentDeviceType.includes("UPE") || props.inputParams["slice"].includes("NPE-UPE")) && (
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
        {(!currentDeviceType.includes("UPE") || props.inputParams["slice"].includes("NPE-UPE")) && (
          <Form.Group as={Col} md="2" controlId="intfNumber">
            <Form.Label>Number</Form.Label>
            <Form.Control size="sm" as="select" onChange={(e) => setCurrentIntfNumber(e.target.value)} value={currentIntfNumber}>
              {intfNumberSelector1 ? intfNumberSelector1 : <option>-</option>}
            </Form.Control>
          </Form.Group>
        )}
        {(!props.inputParams["slice"].includes("SP") && !currentDeviceType.includes("UPE")) ||
        (props.inputParams["slice"].includes("SP") && currentDeviceType.includes("ACC")) ||
        props.inputParams["slice"].includes("NPE-UPE") ? (
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
        {currentDeviceType.includes("UPE") && props.inputParams["slice"].includes("NPE-UPE") && (
          <Form.Group as={Col} md="2" controlId="upe_vlan">
            <Form.Label>UPE Vlan</Form.Label>
            <Form.Control
              size="sm"
              required
              type="text"
              onChange={(e) => setCurrentUPEVlan(e.target.value)}
              value={currentUPEVlan}
            />
          </Form.Group>
        )}
        <button style={{ marginTop: "30px" }} className="bg-blue btn btn-primary btn-sm mb-3" onClick={deviceAddHandler}>
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
};

export default FormL3VPNCONNECTED;
