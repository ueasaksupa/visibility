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

const NavigationBar = (props) => {
  const endpoint = "http://127.0.0.1:5000/notification/subscribe";
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
                <div>
                  <div className="text-muted float-right">{notificationAge}</div>{" "}
                  <div>
                    link between <b>{ele.source}</b> and <b>{ele.target}</b>
                  </div>{" "}
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
    const socket = socketIOClient(endpoint);
    socket.on("msg", (data) => {
      console.log(data);
      setAlertNum((prevAlertNum) => prevAlertNum + 1);
      fetchAlertList();
    });
  }, []);

  return (
    <Navbar collapseOnSelect expand="lg" bg="light" className="navbar-custom">
      <Navbar.Brand className="px-4" as={Link} to="/">
        Visibility
        <img alt="" src="/icon/network.svg" width="25" height="25" className="d-inline-block align-top" />
      </Navbar.Brand>
      <Nav className="ml-auto">
        <Dropdown drop="left" onClick={fetchAlertList}>
          <Dropdown.Toggle variant={alertNum > 0 ? "danger" : "info"}>
            <i className="bell icon"></i>
            {"   "}
            <Badge variant="light">{alertNum}</Badge>
          </Dropdown.Toggle>
          <Dropdown.Menu>
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
