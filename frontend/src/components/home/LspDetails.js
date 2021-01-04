import React, { useState, useEffect } from "react";

import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import DataTable from "react-data-table-component";

import xtcExtractor from "../api/xtcExtractor";
import { SR_PCE_API } from "../api/apiBackend";

const SubHeader = (props) => {
  return <input type="text" placeholder="search" onChange={props.onSearchChangeHandler} />;
};

const LspPathDetail = (props) => {
  if (props.selectedLsp === null) {
    return <div style={{ margin: "0 1rem 1rem" }}>Select Lsp on table above to see path detail</div>;
  }
  return (
    <Card>
      <Card.Header>LSP Path - {props.selectedLsp.lspName}</Card.Header>
      <Card.Body>
        <div>{props.selectedLsp.path.join(" -> ")}</div>
      </Card.Body>
    </Card>
  );
};

const LspDetails = (props) => {
  const [lspData, setLspData] = useState(null);
  const [selectedLsp, setSelectedLsp] = useState(null);
  const tableColumns = [
    {
      name: "Status",
      sortable: true,
      selector: "operationalState",
      cell: (row) => {
        if (row.operationalState === "lsp-up") {
          return <Badge variant="success">lsp-up</Badge>;
        } else {
          return <Badge variant="danger">lsp-down</Badge>;
        }
      },
    },
    {
      name: "Tunnel name",
      selector: "lspName",
      sortable: true,
    },
    {
      name: "Source",
      selector: "source",
      sortable: true,
    },
    {
      name: "Target",
      selector: "target",
      sortable: true,
    },
    {
      name: "Binding SID",
      selector: "bindingSid",
      sortable: true,
    },
    {
      name: "Color",
      selector: "color",
      sortable: true,
    },
  ];

  useEffect(() => {
    let lspDataCache = sessionStorage.getItem("lspData");
    if (lspDataCache) {
      // use data in cache if possible
      console.log("lspData cache hit");
      setLspData(JSON.parse(lspDataCache));
    } else {
      // if the first time access fetch data
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    let lspR = await SR_PCE_API.get("/lsp/subscribe/txt?max-lsp-history=0&batch=0");
    console.log("lspR:", lspR);
    let extractor = new xtcExtractor();
    if (lspR.data) {
      setLspData(extractor.getLspObject(lspR.data));
      // set sessionStorage for caching
      sessionStorage.setItem("lspData", JSON.stringify(extractor.getLspObject(lspR.data)));
    } else {
      setLspData(undefined);
    }
  };

  const onSearchChangeHandler = (e) => {
    const type = e.target.type;
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    const tmp = [];
    /*
    if event come from search-box 
    */
  };

  const onRefreshButton = () => {
    setLspData(null);
    fetchData();
  };

  const onRowClickedHandler = (row) => {
    if (selectedLsp !== null) {
      if (selectedLsp.lspName === row.lspName) {
        // De-selection
        setSelectedLsp(null);
        props.onLspTableClick(null);
      } else {
        // Change selection
        setSelectedLsp(row);
        props.onLspTableClick(row);
      }
    } else {
      // select init
      setSelectedLsp(row);
      props.onLspTableClick(row);
    }
  };

  const generateDataTableRow = () => {
    const rows = [];
    for (const row in lspData) {
      rows.push(lspData[row]);
    }
    return rows;
  };

  if (lspData === null) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  } else if (lspData === undefined) {
    return <div className="text-center mt-5">ERROR: no data from API request</div>;
  } else {
    let tableData = generateDataTableRow();
    return (
      <>
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex">
              <div className="mr-4">LSP Details</div>
              <div>
                <button onClick={onRefreshButton} className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-sync-alt buttonize"></i>
                </button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="lsp-table">
              <DataTable
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50, 100]}
                pointerOnHover
                dense
                noHeader
                subHeader
                subHeaderComponent={<SubHeader onSearchChangeHandler={onSearchChangeHandler} />}
                columns={tableColumns}
                data={tableData}
                onRowClicked={onRowClickedHandler}
              />
            </div>
          </Card.Body>
        </Card>
        <LspPathDetail selectedLsp={selectedLsp} />
      </>
    );
  }
};

export default LspDetails;
