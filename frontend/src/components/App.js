import React from "react";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import NavigationBar from "./NavigationBar";

import LspOptimize from "./lspOptimize/LspOptimize";
import Home from "./home/Home";
import ServiceView from "./services/View";
import ServiceNew from "./services/New";

import "./App.css";
// Every icon i choosen is from sematic-ui
// https://semantic-ui.com/elements/icon.html

const SideBar = () => {
  return (
    <div className="sidenav">
      <Link to="/">
        <i className="fas fa-home"></i>
        <div className="icon-title">Home</div>
      </Link>
      <Link to="/lspOptimize">
        <i className="fas fa-draw-polygon"></i>
        <div className="icon-title">LSP Optimize</div>
      </Link>
      <Link to="/service">
        <i className="fas fa-tachometer-alt"></i>
        <div className="icon-title">Services</div>
      </Link>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <SideBar />
      <NavigationBar />
      {/* main-content div will set the flag for 100% width and 100% height */}
      <div className="main-content">
        {/*
          play with this div if you want to adjust padding or margin of main-content
          it will effect every page 
        */}
        <div className="h-100 w-100 pt-4 pb-2">
          <Switch>
            <Route path="/lspOptimize" exact>
              <LspOptimize />
            </Route>
            <Route path="/service" exact>
              <ServiceView />
            </Route>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/service/new" exact>
              <ServiceNew />
            </Route>
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
