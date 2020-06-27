import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { NSO_API } from "../api/apiBackend";

export const FormVPWS = (props) => {
  let deviceOption = [<option key="0">-</option>];
  const [intfNumberSelector1, setIntfNumberSelector1] = useState(null);
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("Access");

  deviceOption = [
    ...deviceOption,
    props.devices.map((deviceName, index) => {
      return <option key={index + 1}>{deviceName}</option>;
    }),
  ];

  useEffect(() => {
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

    fetchInterfaceId();
  }, [currentDevice, currentIntfType]);

  const renderDeviceTableBody = () => {
    if (props.inputParams.devices.length !== 0) {
      return props.inputParams.devices.map((row, index) => {
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
            onChange={props.onChange}
            value={props.inputParams["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="vlan-id">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Start vlan number"
            onChange={props.onChange}
            value={props.inputParams["vlan-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="evpn-evi">
          <Form.Label>Start EVI Number</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Start EVI number"
            onChange={props.onChange}
            value={props.inputParams["evpn-evi"]}
          />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="labelPE">
          <Form.Label>Label PE</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.labelPE} />
        </Form.Group>
        <Form.Group as={Col} controlId="labelACC">
          <Form.Label>Label ACC</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams.labelACC} />
        </Form.Group>
        <Form.Group as={Col} controlId="x-connect-group">
          <Form.Label>x-connect-group</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["x-connect-group"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="p2p-domain">
          <Form.Label>p2p-domain</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["p2p-domain"]} />
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
            {intfNumberSelector1 ? intfNumberSelector1 : <option>-</option>}
          </Form.Control>
        </Form.Group>
        <button
          className="bg-blue btn btn-primary btn-sm my-3"
          onClick={(e) => {
            e.preventDefault();
            props.onDeviceAdd({
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "evpn-source": currentDeviceType === "Access" ? props.inputParams.labelACC : props.inputParams.labelPE,
              "evpn-target": currentDeviceType === "Access" ? props.inputParams.labelPE : props.inputParams.labelACC,
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
};

export const FormELAN = (props) => {
  let deviceOption = [<option key="0">-</option>];
  const [intfNumberSelector1, setIntfNumberSelector1] = useState(null);
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");

  deviceOption = [
    ...deviceOption,
    props.devices.map((deviceName, index) => {
      return <option key={index + 1}>{deviceName}</option>;
    }),
  ];

  useEffect(() => {
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
    fetchInterfaceId();
  }, [currentDevice, currentIntfType]);

  const renderDeviceTableBody = () => {
    if (props.inputParams.devices.length !== 0) {
      return props.inputParams.devices.map((row, index) => {
        return (
          <tr key={index}>
            <td>{row.device}</td>
            <td>
              {row["interface-type"]} {row[`${row["interface-type"]}-id`]}
            </td>
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
            onChange={props.onChange}
            value={props.inputParams["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="vlan-id">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="vlan number"
            onChange={props.onChange}
            value={props.inputParams["vlan-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="evpn-evi">
          <Form.Label>Start EVI Number</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["evpn-evi"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <Form.Row>
        <Form.Group as={Col} controlId="evpn-rt">
          <Form.Label>RT</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["evpn-rt"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="bridge-group">
          <Form.Label>bridge-group</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["bridge-group"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="bridge-domain">
          <Form.Label>bridge-domain</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["bridge-domain"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <div>Devices</div>
      <Form.Row>
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
            {intfNumberSelector1 ? intfNumberSelector1 : <option>-</option>}
          </Form.Control>
        </Form.Group>
        <button
          className="bg-blue btn btn-primary btn-sm my-3"
          onClick={(e) => {
            e.preventDefault();
            props.onDeviceAdd({
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderDeviceTableBody()}</tbody>
      </Table>
    </>
  );
};

export const FormL3VPNBGP = (props) => {
  let deviceOption = [<option key="0">-</option>];
  const [intfNumberSelector1, setIntfNumberSelector1] = useState(null);
  const [currentIntfType, setCurrentIntfType] = useState("TenGigE");
  const [currentIntfNumber, setCurrentIntfNumber] = useState("-");
  const [currentDevice, setCurrentDevice] = useState("-");
  const [currentDeviceType, setCurrentDeviceType] = useState("Access");
  const [currentIpGW, setCurrentIpGW] = useState("");

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
            onChange={props.onChange}
            value={props.inputParams["service-id"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="pe-vlan">
          <Form.Label>Start Vlan ID</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="vlan number"
            onChange={props.onChange}
            value={props.inputParams["pe-vlan"]}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="rt">
          <Form.Label>RT</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["rt"]} />
        </Form.Group>
        <Form.Group as={Col} controlId="vrf">
          <Form.Label>VRF</Form.Label>
          <Form.Control required type="text" onChange={props.onChange} value={props.inputParams["vrf"]} />
        </Form.Group>
      </Form.Row>
      {/*  */}
      <div>Devices</div>
      <Form.Row>
        <Form.Group as={Col} md="1" controlId="device-type">
          <Form.Label>DeviceType</Form.Label>
          <Form.Control as="select" onChange={(e) => setCurrentDeviceType(e.target.value)} value={currentDeviceType}>
            <option>Access</option>
            <option>UPE#1</option>
            <option>UPE#2</option>
            <option>NPE#1</option>
            <option>NPE#2</option>
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
            {intfNumberSelector1 ? intfNumberSelector1 : <option>-</option>}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md="2" controlId="gatewayIp">
          <Form.Label>IPv4 Gateway</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="0.0.0.0/30"
            onChange={(e) => setCurrentIpGW(e.target.value)}
            value={currentIpGW}
          />
        </Form.Group>
        <button
          className="bg-blue btn btn-primary btn-sm my-3"
          onClick={(e) => {
            e.preventDefault();
            props.onDeviceAdd({
              "device-type": currentDeviceType,
              device: currentDevice,
              "interface-type": currentIntfType,
              [`${currentIntfType}-id`]: currentIntfNumber,
              "pe-ipv4-gw": currentIpGW,
            });
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderDeviceTableBody()}</tbody>
      </Table>
    </>
  );
};
