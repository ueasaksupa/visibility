import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Link } from "react-router-dom";
//
import BACKEND from "./api/pythonBackend";
// Bootstrap
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Badge from "react-bootstrap/Badge";

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </div>
));

const NavigationBar = (props) => {
  const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST || "127.0.0.1";
  const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || "5000";
  const endpoint = `http://${BACKEND_HOST}:${BACKEND_PORT}/notification/subscribe`;
  const [alertNum, setAlertNum] = useState(0);
  const [alertList, setAlertList] = useState([]);

  const fetchAlertList = async () => {
    let response = await BACKEND.get("/notifications");
    setAlertList(response.data.data);
  };

  const handleClearOneAlert = (e, ele) => {
    e.stopPropagation();
    console.log(ele);
  };

  const renderDropdownMenu = () => {
    if (alertList.length !== 0) {
      return alertList.map((ele, index) => {
        let timeDiff = (Date.now() - new Date(ele.created_on)) / 1000; // TIME DIFF in second
        let notificationAge;
        if (timeDiff < 60) {
          notificationAge = "Just now";
        } else if (timeDiff < 3600) {
          notificationAge = `${Math.floor(timeDiff / 60)}m ago`;
        } else if (timeDiff < 86400) {
          notificationAge = `${Math.floor(timeDiff / 60 / 60)}h ago`;
        } else {
          notificationAge = `${Math.floor(timeDiff / 60 / 60 / 24)}d ago`;
        }
        return (
          <div key={index}>
            <Dropdown.Item>
              <div style={{ minWidth: "20rem" }}>
                <div>
                  <button onClick={(e) => handleClearOneAlert(e, ele)} style={{ fontSize: "1rem" }} className="close float-right">
                    x
                  </button>
                  <div className="h5">{`Link ${ele.status}`}</div>
                </div>
                <div className="row">
                  <div className="col-auto mr-auto">
                    <div className="text-wrap">
                      link between <b>{ele.source}</b> and <b>{ele.target}</b>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="text-muted">{notificationAge}</div>
                  </div>
                </div>
              </div>
            </Dropdown.Item>
            <Dropdown.Divider />
          </div>
        );
      });
    } else {
      return <Dropdown.Item>No alarm</Dropdown.Item>;
    }
  };

  useEffect(() => {
    fetchAlertList();
    // const socket = socketIOClient(endpoint);
    // socket.on("msg", (data) => {
    //   console.log(data);
    //   setAlertNum((prevAlertNum) => prevAlertNum + 1);
    //   fetchAlertList();
    // });
  }, []);

  return (
    <Navbar collapseOnSelect expand="lg" bg="light" className="navbar-custom">
      <Navbar.Brand className="px-4" as={Link} to="/">
        Visibility
        <img alt="" src="/icon/network.svg" width="25" height="25" className="d-inline-block align-top" />
      </Navbar.Brand>
      <Nav className="ml-auto">
        <Dropdown drop="left" onClick={fetchAlertList}>
          <Dropdown.Toggle as={CustomToggle}>
            <Badge pill variant="danger" className="p-2 pointer">
              <i className="fa fa-bell mr-1"></i>
              {alertNum}
            </Badge>
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ width: "500px" }}>
            <button style={{ fontSize: "0.8rem", color: "blue" }} className="close float-right mr-2">
              Clear all
            </button>
            <div className="h6 ml-2">Notifications</div>
            <Dropdown.Divider />
            {renderDropdownMenu()}
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default NavigationBar;
