import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

const Socket = (props) => {
  const endpoint = "http://127.0.0.1:5000/notification/subscribe";
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = socketIOClient(endpoint);
    socket.on("msg", (data) => {
      console.log(data);

      setMessage(data.type);
    });
  }, []);

  return <div style={{ textAlign: "center" }}>{message}</div>;
};

export default Socket;
