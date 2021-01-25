import React from "react";
import { shallow, mount } from "enzyme";
import moxios from "moxios";
import { NSO_API } from "../../api/apiBackend";
//
import ServiceNew from "../New";
import FormVPWS from "../FormVPWS";
import FormELAN from "../FormELAN";
import FormL3VPNBGP from "../FormL3VPNBGP";
import FormL3VPNCONNECTED from "../FormL3VPNCONNECTED";
import FormL3VPNSTATIC from "../FormL3VPNSTATIC";
import FormL2L3 from "../FormL2L3";
//

beforeEach(() => {
  moxios.install(NSO_API);
});

afterEach(function () {
  moxios.uninstall(NSO_API);
});

it("render service form", () => {
  let wrapper = mount(<ServiceNew />);
  const serviceSelectBox = wrapper.find("#service");
  //
  serviceSelectBox.simulate("change", { target: { id: "service", value: "VPWS" } });
  expect(wrapper.find(FormVPWS)).toHaveLength(1);
  //
  serviceSelectBox.simulate("change", { target: { id: "service", value: "ELAN" } });
  expect(wrapper.find(FormELAN)).toHaveLength(1);
  //
  serviceSelectBox.simulate("change", { target: { id: "service", value: "L2L3" } });
  expect(wrapper.find(FormL2L3)).toHaveLength(1);
  //
  serviceSelectBox.simulate("change", { target: { id: "service", value: "L3VPNBGP" } });
  expect(wrapper.find(FormL3VPNBGP)).toHaveLength(1);
  //
  serviceSelectBox.simulate("change", { target: { id: "service", value: "L3VPNCONNECTED" } });
  expect(wrapper.find(FormL3VPNCONNECTED)).toHaveLength(1);
  //
  serviceSelectBox.simulate("change", { target: { id: "service", value: "L3VPNSTATIC" } });
  expect(wrapper.find(FormL3VPNSTATIC)).toHaveLength(1);
});

describe("mocking axios requests", function () {
  it("should handle dry-run VPWS service correctly", (done) => {
    moxios.stubRequest("restconf/data?dry-run=native", {
      status: 201,
      responseText: {
        "dry-run-result": {
          native: {
            device: [
              {
                name: "node1",
                data: "DRY RUN RESULTS",
              },
              {
                name: "node2",
                data: "DRY RUN RESULTS",
              },
            ],
          },
        },
      },
    });
    let wrapper = mount(<ServiceNew />);

    const serviceSelectBox = wrapper.find("#service");
    serviceSelectBox.simulate("change", { target: { id: "service", value: "VPWS" } });
    //
    const form = wrapper.find(FormVPWS);
    const inputData = {
      "service-id": "test_service",
      "vlan-id": 1201,
      "evpn-evi": 1201,
      "x-connect-group": "vpws-bg-bw",
      "p2p-domain": "eline-bg-bw",
      labelPE: 1333,
      labelACC: 3331,
    };
    for (let key in inputData) {
      form.find(`#${key}`).simulate("change", { target: { id: key, value: inputData[key] } });
    }
    // devices
    let devices = [
      {
        "device-type": "Access",
        device: "ncs540-5",
        intfType: "TenGigE",
        intfNumber: "0/0/0/12",
      },
      {
        "device-type": "Core",
        device: "AGG3_NPE1",
        intfType: "HundredGigE",
        intfNumber: "0/0/0/0",
      },
      {
        "device-type": "Core",
        device: "AGG3_NPE2",
        intfType: "HundredGigE",
        intfNumber: "0/0/0/0",
      },
    ];
    for (let device of devices) {
      for (let key in device) {
        form.find(`#${key}`).simulate("change", { target: { id: key, value: device[key] } });
      }
      // add device click
      form.find("button.bg-blue").simulate("click");
    }
    form.update();
    wrapper.find("form").simulate("submit");

    moxios.wait(() => {
      wrapper.update();
      expect(wrapper.find("#dry-run-result")).toHaveLength(1);
      done();
      wrapper.unmount();
    });
  });
  it("should handle dry-run ELAN service correctly", (done) => {
    moxios.stubRequest("restconf/data?dry-run=native", {
      status: 201,
      responseText: {
        "dry-run-result": {
          native: {
            device: [
              {
                name: "node1",
                data: "DRY RUN RESULTS",
              },
              {
                name: "node2",
                data: "DRY RUN RESULTS",
              },
            ],
          },
        },
      },
    });
    let wrapper = mount(<ServiceNew />);

    const serviceSelectBox = wrapper.find("#service");
    serviceSelectBox.simulate("change", { target: { id: "service", value: "ELAN" } });
    //
    const form = wrapper.find(FormELAN);
    const inputData = {
      "vlan-id": 1301,
      "evpn-evi": 1301,
      "evpn-rt": 1000,
      "bridge-group": "elan-bg-bw",
      "bridge-domain": "elan",
    };
    for (let key in inputData) {
      form.find(`#${key}`).simulate("change", { target: { id: key, value: inputData[key] } });
    }
    // devices
    let devices = [
      {
        device: "ncs540-5",
        intfType: "TenGigE",
        intfNumber: "0/0/0/13",
      },
      {
        device: "AGG3_NPE1",
        intfType: "Bundle-Ether",
        intfNumber: 1,
      },
      {
        device: "AGG4_NPE2",
        intfType: "Bundle-Ether",
        intfNumber: 1,
      },
    ];
    for (let device of devices) {
      for (let key in device) {
        form.find(`#${key}`).simulate("change", { target: { id: key, value: device[key] } });
      }
      // add device click
      form.find("button.bg-blue").simulate("click");
    }
    form.update();
    wrapper.find("form").simulate("submit");

    moxios.wait(() => {
      wrapper.update();
      expect(wrapper.find("#dry-run-result")).toHaveLength(1);
      done();
      wrapper.unmount();
    });
  });
});
