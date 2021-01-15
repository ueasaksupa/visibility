import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";

const FormVPWS = forwardRef((props, ref) => {
  let deviceOption = [<option key="0">-</option>];
  const [devices, setDevices] = useState([]);
  const [intfNumberSelector, setIntfNumberSelector] = useState(null);
  //
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("Access");
  //
  const [inputCommon, setInputCommon] = useState({
    "service-id": "",
    "vlan-id": "",
    "evpn-evi": "",
    "x-connect-group": "",
    "p2p-domain": "",
    labelPE: "",
    labelACC: "",
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
      for (let i = 0; i < props.scale; i++) {
        servicesParams.push({
          "service-id": `${inputCommon["service-id"]}_${i}`,
          "common-param": {
            "vlan-id": parseInt(inputCommon["vlan-id"]) + i,
            "evpn-evi": parseInt(inputCommon["evpn-evi"]) + i,
            "x-connect-group": inputCommon["x-connect-group"],
            "p2p-domain": inputCommon["p2p-domain"],
          },
          "device-specific": {
            devices: [...devices],
          },
        });
      }
      payload["vpws:vpws"] = servicesParams;
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

    fetchInterfaceId();
  }, [currentDevice, currentIntfType]);

  const renderDeviceTableBody = () => {
    if (devices.length !== 0) {
      return devices.map((row, index) => {
        return (
          <tr key={index}>
            <td>{row.device}</td>
            <td>
              {row["interface-type"]} {row[`${row["interface-type"]}-id`]}
            </td>
            <td>{row["evpn-source"]}</td>
            <td>{row["evpn-target"]}</td>
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
          <td colSpan="5" className="text-center">
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
            type="text"
            placeholder="eline service"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="vlan-id">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Start vlan number"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["vlan-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="evpn-evi">
          <Form.Label>Start EVI Number</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Start EVI number"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["evpn-evi"]}
          />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="labelPE">
          <Form.Label>Label PE</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon.labelPE}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="labelACC">
          <Form.Label>Label ACC</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon.labelACC}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="x-connect-group">
          <Form.Label>x-connect-group</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["x-connect-group"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="p2p-domain">
          <Form.Label>p2p-domain</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["p2p-domain"]}
          />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <div>Devices</div>
      <Form.Row>
        <Form.Group as={Col} md="1" controlId="device-type">
          <Form.Label>DeviceType</Form.Label>
          <Form.Control as="select" onChange={(e) => setCurrentDeviceType(e.target.value)} value={currentDeviceType}>
            <option>Access</option>
            <option>Core</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="2" controlId="device">
          <Form.Label>Device</Form.Label>
          <Form.Control
            as="select"
            onChange={(e) => {
              setCurrentDevice(e.target.value);
            }}
            value={currentDevice}
          >
            {deviceOption}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="2" controlId="intfType">
          <Form.Label>Interface</Form.Label>
          <Form.Control
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
        <Form.Group as={Col} md="2" controlId="intfNumber">
          <Form.Label>Number</Form.Label>
          <Form.Control as="select" onChange={(e) => setCurrentIntfNumber(e.target.value)} value={currentIntfNumber}>
            {intfNumberSelector ? intfNumberSelector : <option>-</option>}
          </Form.Control>
        </Form.Group>
        <button
          style={{ marginTop: "30px" }}
          className="bg-blue btn btn-primary btn-sm mb-3"
          onClick={(e) => {
            e.preventDefault();
            onDeviceAddHandler({
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "evpn-source": currentDeviceType === "Access" ? inputCommon.labelACC : inputCommon.labelPE,
              "evpn-target": currentDeviceType === "Access" ? inputCommon.labelPE : inputCommon.labelACC,
            });
          }}
        >
          <i className="fas fa-plus" />
        </button>
      </Form.Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>DeviceName</th>
            <th>Interface</th>
            <th>EVPN source</th>
            <th>EVPN target</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderDeviceTableBody()}</tbody>
      </Table>
    </>
  );
});

export default FormVPWS;
