import React from "react";
import { mount } from "enzyme";
import App from "./App";

it("make sure app not crash", () => {
  const wrapper = mount(<App />);
});
