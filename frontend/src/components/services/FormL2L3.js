import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";

const FormL2L3 = (props) => {
  let deviceOption = [<option key="0">-</option>];
  const [intfNumberSelector1, setIntfNumberSelector1] = useState(null);
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("NPE");
  const [currentBgpAs, setCurrentBgpAs] = useState("100");
  const [inputNPE, setInputNPE] = useState({
    "bvi-interface": "2222",
    "bvi-ipv4-address": "22.22.22.22/30",
    "bvi-mac-address": "2222.2222.2222",
    "evpn-evi": 2222,
    "evpn-rt": "2222:2222",
    "destination-ip": "2.2.2.2/30",
    interface: "HundredGigE0/0/0/1",
    "forward-ip": "3.3.3.3",
  });
  const [inputUPE, setInputUPE] = useState({ "agg-address": "4.4.4.4/30" });
  const [inputACC, setInputACC] = useState({
    "bvi-interface": "2222",
    "bvi-ipv4-address": "2.2.2.2/30",
    "bvi-mac-address": "2222.2222.2222",
    "evpn-evi": 2222,
    "evpn-rt": "2222:2222",
  });

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
            <td>{row.type}</td>
            <td>{row.device}</td>
            <td>
              {row["interface-type"]} {row[`${row["interface-type"]}-id`]}
            </td>
            <td>{row["bgp-as"]}</td>
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
        <Form.Group as={Col} controlId="vrf">
          <Form.Label>
            VRF<small className="mx-2">(Automatically append VLAN number)</small>
          </Form.Label>
          <Form.Control size="sm" required type="text" onChange={props.onChange} value={props.inputParams["vrf"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <div>Devices</div>
      <Form.Row>
        <Form.Group as={Col} md="1" controlId="device-type">
          <Form.Label>DeviceType</Form.Label>
          <Form.Control size="sm" as="select" onChange={(e) => setCurrentDeviceType(e.target.value)} value={currentDeviceType}>
            <option value="UPE">UPE</option>
            <option value="NPE">NPE</option>
            <option value="ACC">Access</option>
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
          <>
            <Form.Group as={Col} md="2" controlId="intfNumber">
              <Form.Label>Number</Form.Label>
              <Form.Control
                size="sm"
                as="select"
                onChange={(e) => setCurrentIntfNumber(e.target.value)}
                value={currentIntfNumber}
              >
                {intfNumberSelector1 ? intfNumberSelector1 : <option>-</option>}
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="bgp-as">
              <Form.Label>bgp as</Form.Label>
              <Form.Control
                size="sm"
                required
                type="text"
                placeholder="100"
                onChange={(e) => setCurrentBgpAs(e.target.value)}
                value={currentBgpAs}
              />
            </Form.Group>
          </>
        )}
      </Form.Row>
      {currentDeviceType === "NPE" && (
        <div className="border rounded p-2 mb-2">
          <div>BVI</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="bvi-interface" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-interface"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["bvi-interface"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="bvi-ipv4-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-ipv4-address"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["bvi-ipv4-address"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="bvi-mac-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-mac-address"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["bvi-mac-address"]}
              />
            </Form.Group>
          </Form.Row>
          <div>EVPN</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="evpn-evi" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-evi"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["evpn-evi"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="evpn-rt" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-rt"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["evpn-rt"]}
              />
            </Form.Group>
          </Form.Row>
          <div>Router-Static Configuration</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="destination-ip" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="destination-ip"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["destination-ip"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="interface" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="interface"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["interface"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="forward-ip" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="forward-ip"
                onChange={(e) => setInputNPE({ ...inputNPE, [e.target.id]: e.target.value })}
                value={inputNPE["forward-ip"]}
              />
            </Form.Group>
          </Form.Row>
        </div>
      )}
      {currentDeviceType === "UPE" && (
        <div className="border rounded p-2 mb-2">
          <div>agg-address</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="agg-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="agg-address"
                onChange={(e) => setInputUPE({ ...inputUPE, [e.target.id]: e.target.value })}
                value={inputUPE["agg-address"]}
              />
            </Form.Group>
          </Form.Row>
        </div>
      )}
      {currentDeviceType === "ACC" && (
        <div className="border rounded p-2 mb-2">
          <div>BVI</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="bvi-interface" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-interface"
                onChange={(e) => setInputACC({ ...inputACC, [e.target.id]: e.target.value })}
                value={inputACC["bvi-interface"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="bvi-ipv4-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-ipv4-address"
                onChange={(e) => setInputACC({ ...inputACC, [e.target.id]: e.target.value })}
                value={inputACC["bvi-ipv4-address"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="bvi-mac-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-mac-address"
                onChange={(e) => setInputACC({ ...inputACC, [e.target.id]: e.target.value })}
                value={inputACC["bvi-mac-address"]}
              />
            </Form.Group>
          </Form.Row>
          <div>EVPN</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="evpn-evi" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-evi"
                onChange={(e) => setInputACC({ ...inputACC, [e.target.id]: e.target.value })}
                value={inputACC["evpn-evi"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="evpn-rt" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-rt"
                onChange={(e) => setInputACC({ ...inputACC, [e.target.id]: e.target.value })}
                value={inputACC["evpn-rt"]}
              />
            </Form.Group>
          </Form.Row>
        </div>
      )}
      <button
        className="bg-blue btn btn-primary btn-sm mb-3"
        onClick={(e) => {
          e.preventDefault();
          if (currentDeviceType === "NPE") {
            props.onDeviceAdd({
              type: currentDeviceType,
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "bgp-as": currentBgpAs,
              "npe-bvi": {
                "bvi-interface": inputNPE["bvi-interface"],
                "bvi-ipv4-address": inputNPE["bvi-ipv4-address"],
                "bvi-mac-address": inputNPE["bvi-mac-address"],
              },
              "npe-evpn": {
                "evpn-evi": inputNPE["evpn-evi"],
                "evpn-rt": inputNPE["evpn-rt"],
              },
              "npe-router-static": {
                "destination-ip": inputNPE["destination-ip"],
                interface: inputNPE["interface"],
                "forward-ip": inputNPE["forward-ip"],
              },
            });
          } else if (currentDeviceType === "UPE") {
            props.onDeviceAdd({
              type: currentDeviceType,
              device: currentDevice,
              "agg-address": inputUPE["agg-address"],
            });
          } else if (currentDeviceType === "ACC") {
            props.onDeviceAdd({
              type: currentDeviceType,
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "bgp-as": currentBgpAs,
              "acc-bvi": {
                "bvi-interface": inputACC["bvi-interface"],
                "bvi-ipv4-address": inputACC["bvi-ipv4-address"],
                "bvi-mac-address": inputACC["bvi-mac-address"],
              },
              "acc-evpn": {
                "evpn-evi": inputACC["evpn-evi"],
                "evpn-rt": inputACC["evpn-rt"],
              },
            });
          }
        }}
      >
        <i className="fas fa-plus" />
      </button>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>type</th>
            <th>DeviceName</th>
            <th>Interface</th>
            <th>BGP AS</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderDeviceTableBody()}</tbody>
      </Table>
    </>
  );
};

export default FormL2L3;
