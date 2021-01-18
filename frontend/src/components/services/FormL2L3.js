import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";

const FormL2L3 = forwardRef((props, ref) => {
  let deviceOption = [<option key="0">-</option>];
  const [devices, setDevices] = useState([]);
  const [intfNumberSelector, setIntfNumberSelector] = useState(null);
  //
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("NPE");
  //
  const [inputCommon, setInputCommon] = useState({ "service-id": "", "pe-vlan": "", rt: "", vrf: "" });
  const [inputDevice, setInputDevice] = useState({
    "bgp-as": 100,
    "npe-bvi-interface": "2222",
    "npe-bvi-ipv4-address": "222.222.222.222/30",
    "npe-bvi-mac-address": "2222.2222.2222",
    "npe-evpn-evi": 2222,
    "npe-evpn-rt": "2222:2222",
    "npe-destination-ip": "2.2.2.2/30",
    "npe-interface": "HundredGigE0/0/0/1",
    "npe-forward-ip": "22.22.22.22",
    "upe-agg-address": "4.4.4.4/30",
    "acc-bvi-interface": "1111",
    "acc-bvi-ipv4-address": "111.111.111.111/30",
    "acc-bvi-mac-address": "1111.1111.1111",
    "acc-evpn-evi": 1111,
    "acc-evpn-rt": "1111:1111",
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
      for (let i = 0; i < scale; i++) {
        let deviceContainer = { NPE: { devices: [] }, UPE: { devices: [] }, ACC: { devices: [] } };
        for (let device of devices) {
          let tmpDevice = { ...device };
          let deviceType = tmpDevice.type;
          delete tmpDevice.type;
          deviceContainer[deviceType].devices.push({ ...tmpDevice });
        }
        servicesParams.push({
          "service-id": `${inputCommon["service-id"]}_${i}`,
          "common-param": {
            "pe-vlan": parseInt(inputCommon["pe-vlan"]) + i,
            vrf: `${inputCommon["vrf"]}_${parseInt(inputCommon["pe-vlan"]) + i}`,
            rt: `100:${parseInt(inputCommon["rt"].split(":")[1]) + i}`,
          },
          ...deviceContainer,
        });
      }
      payload["L2L3:L2L3"] = servicesParams;
      return payload;
    },
    createDBPayload() {
      return {
        payload: this.createPayload(),
        status: "active",
        type: "L2L3",
        scale: 1,
        name: inputCommon["service-id"],
        st_vlan: inputCommon["pe-vlan"],
        rt: inputCommon["rt"],
        vrf: inputCommon["vrf"],
        devices: [...devices],
      };
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
                {intfNumberSelector ? intfNumberSelector : <option>-</option>}
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="bgp-as">
              <Form.Label>bgp as</Form.Label>
              <Form.Control
                size="sm"
                required
                type="text"
                placeholder="100"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["bgp-as"]}
              />
            </Form.Group>
          </>
        )}
      </Form.Row>
      {currentDeviceType === "NPE" && (
        <div className="border rounded p-2 mb-2">
          <div>BVI</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="npe-bvi-interface" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-interface"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-bvi-interface"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="npe-bvi-ipv4-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-ipv4-address"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-bvi-ipv4-address"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="npe-bvi-mac-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-mac-address"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-bvi-mac-address"]}
              />
            </Form.Group>
          </Form.Row>
          <div>EVPN</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="npe-evpn-evi" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-evi"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-evpn-evi"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="npe-evpn-rt" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-rt"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-evpn-rt"]}
              />
            </Form.Group>
          </Form.Row>
          <div>Router-Static Configuration</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="npe-destination-ip" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="destination-ip"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-destination-ip"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="npe-interface" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="interface"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-interface"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="npe-forward-ip" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="forward-ip"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["npe-forward-ip"]}
              />
            </Form.Group>
          </Form.Row>
        </div>
      )}
      {currentDeviceType === "UPE" && (
        <div className="border rounded p-2 mb-2">
          <div>agg-address</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="upe-agg-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="agg-address"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["upe-agg-address"]}
              />
            </Form.Group>
          </Form.Row>
        </div>
      )}
      {currentDeviceType === "ACC" && (
        <div className="border rounded p-2 mb-2">
          <div>BVI</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="acc-bvi-interface" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-interface"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["acc-bvi-interface"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="acc-bvi-ipv4-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-ipv4-address"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["acc-bvi-ipv4-address"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="acc-bvi-mac-address" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="bvi-mac-address"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["acc-bvi-mac-address"]}
              />
            </Form.Group>
          </Form.Row>
          <div>EVPN</div>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="acc-evpn-evi" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-evi"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["acc-evpn-evi"]}
              />
            </Form.Group>
            <Form.Group as={Col} md="3" controlId="acc-evpn-rt" className="m-0">
              <Form.Control
                required
                size="sm"
                type="text"
                placeholder="evpn-rt"
                onChange={(e) => setInputDevice({ ...inputDevice, [e.target.id]: e.target.value })}
                value={inputDevice["acc-evpn-rt"]}
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
            onDeviceAddHandler({
              type: currentDeviceType,
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "bgp-as": inputDevice["bgp-as"],
              "npe-bvi": {
                "bvi-interface": inputDevice["npe-bvi-interface"],
                "bvi-ipv4-address": inputDevice["npe-bvi-ipv4-address"],
                "bvi-mac-address": inputDevice["npe-bvi-mac-address"],
              },
              "npe-evpn": {
                "evpn-evi": inputDevice["npe-evpn-evi"],
                "evpn-rt": inputDevice["npe-evpn-rt"],
              },
              "npe-router-static": {
                "destination-ip": inputDevice["npe-destination-ip"],
                interface: inputDevice["npe-interface"],
                "forward-ip": inputDevice["npe-forward-ip"],
              },
            });
          } else if (currentDeviceType === "UPE") {
            onDeviceAddHandler({
              type: currentDeviceType,
              device: currentDevice,
              "agg-address": inputDevice["upe-agg-address"],
            });
          } else if (currentDeviceType === "ACC") {
            onDeviceAddHandler({
              type: currentDeviceType,
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "bgp-as": inputDevice["bgp-as"],
              "acc-bvi": {
                "bvi-interface": inputDevice["acc-bvi-interface"],
                "bvi-ipv4-address": inputDevice["acc-bvi-ipv4-address"],
                "bvi-mac-address": inputDevice["acc-bvi-mac-address"],
              },
              "acc-evpn": {
                "evpn-evi": inputDevice["acc-evpn-evi"],
                "evpn-rt": inputDevice["acc-evpn-rt"],
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
});

export default FormL2L3;
