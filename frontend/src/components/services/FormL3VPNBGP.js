import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";

const FormL3VPNBGP = forwardRef((props, ref) => {
  let deviceOption = [<option key="0">-</option>];
  const [devices, setDevices] = useState([
    {
      "device-type": "NPE1",
      device: "AGG3_NPE1",
      "interface-type": "HundredGigE",
      "HundredGigE-id": "0/0/0/3",
      "pe-ipv4-gw": "13.0.1.5/30",
    },
    {
      "device-type": "NPE2",
      device: "AGG4_NPE2",
      "interface-type": "HundredGigE",
      "HundredGigE-id": "0/0/0/3",
      "pe-ipv4-gw": "13.0.1.5/30",
    },
    {
      "device-type": "UPE1",
      device: "AGG1_UPE1",
    },
    {
      "device-type": "UPE2",
      device: "AGG2_UPE2",
    },
    {
      "device-type": "ACC",
      device: "ncs540-5",
      "interface-type": "TenGigE",
      "TenGigE-id": "0/0/0/3",
      "pe-ipv4-gw": "14.0.1.5/30",
      acc_vlan: 1541,
    },
  ]);
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
    "service-id": "L3_BGP_BG_BW1541",
    vrf: "L3_BGP_BG_BW1541",
    rt: "100:1541",
    "pe-vlan": 1541,
    slice: "NPE-ACC-BW",
    neighbor: "13.0.1.2",
    neighbor1: "13.0.1.6",
    neighbor2: "14.0.1.2",
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
        servicesParams.push({
          "service-id": `${inputCommon["service-id"]}_${i}`,
          "l3vpn-connected-type": inputCommon["slice"],
          "common-param": {
            "pe-vlan": parseInt(inputCommon["pe-vlan"]) + i,
            vrf: `${inputCommon["vrf"]}_${parseInt(inputCommon["pe-vlan"]) + i}`,
            rt: `100:${parseInt(inputCommon["rt"].split(":")[1]) + i}`,
          },
          [slice_container]: {
            devices: [...devices],
            "npe-router-bgp": {
              neighbor: inputCommon["neighbor"],
              neighbor1: inputCommon["neighbor1"],
            },
            "acc-router-bgp": {
              neighbor2: inputCommon["neighbor2"],
            },
          },
        });
      }
      payload["L3VPNbgp:L3VPNbgp"] = servicesParams;
      return payload;
    },
    createDBPayload() {
      return {
        payload: this.createPayload(),
        status: "active",
        type: "L3VPNbgp",
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
            type="text"
            placeholder="vlan number"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["pe-vlan"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="rt">
          <Form.Label>RT</Form.Label>
          <Form.Control
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
            as="select"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["slice"]}
          >
            <option value="NPE-ACC-BW">Bandwidth</option>
            <option value="NPE-ACC-LT">Latency</option>
            <option value="NPE-ACC-SP">Special</option>
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="3" controlId="neighbor">
          <Form.Label>NPE1 BGP Neighbor</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["neighbor"]}
          />
        </Form.Group>
        <Form.Group as={Col} md="3" controlId="neighbor1">
          <Form.Label>NPE2 BGP Neighbor</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["neighbor1"]}
          />
        </Form.Group>
        <Form.Group as={Col} md="3" controlId="neighbor2">
          <Form.Label>ACC BGP Neighbor</Form.Label>
          <Form.Control
            required
            type="text"
            onChange={(e) => setInputCommon({ ...inputCommon, [e.target.id]: e.target.value })}
            value={inputCommon["neighbor2"]}
          />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <div>Devices</div>
      <Form.Row>
        <Form.Group as={Col} md="1" controlId="device-type">
          <Form.Label>DeviceType</Form.Label>
          <Form.Control as="select" onChange={(e) => setCurrentDeviceType(e.target.value)} value={currentDeviceType}>
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
            <Form.Control as="select" onChange={(e) => setCurrentIntfNumber(e.target.value)} value={currentIntfNumber}>
              {intfNumberSelector ? intfNumberSelector : <option>-</option>}
            </Form.Control>
          </Form.Group>
        )}
        {!currentDeviceType.includes("UPE") && (
          <Form.Group as={Col} md="2" controlId="gatewayIp">
            <Form.Label>IPv4 Gateway</Form.Label>
            <Form.Control
              type="text"
              placeholder="0.0.0.0/30"
              onChange={(e) => setCurrentIpGW(e.target.value)}
              value={currentIpGW}
            />
          </Form.Group>
        )}
        {currentDeviceType === "ACC" && (
          <Form.Group as={Col} md="2" controlId="acc_vlan">
            <Form.Label>Access Vlan</Form.Label>
            <Form.Control type="text" onChange={(e) => setCurrentAccVlan(e.target.value)} value={currentAccVlan} />
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
              onDeviceAddHandler({
                "device-type": currentDeviceType,
                device: currentDevice,
                "interface-type": currentIntfType,
                [`${currentIntfType}-id`]: currentIntfNumber,
                "pe-ipv4-gw": currentIpGW,
              });
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

export default FormL3VPNBGP;
