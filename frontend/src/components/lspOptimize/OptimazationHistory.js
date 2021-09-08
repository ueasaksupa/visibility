import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

//
import BACKEND from "../api/pythonBackend";
import { WAE_API } from "../api/apiBackend";
import { useLspOptimizeContext } from "./ContextProvider";

const ShowDryRunResult = (props) => {
  return <span style={{ whiteSpace: "pre-line" }}>{props.result}</span>;
};

const OptimizationHistory = (props) => {
  const [state, dispatch] = useLspOptimizeContext();
  const [modalShow, setModalShow] = useState(false);
  const [dryrunResult, setDryrunResult] = useState(null);
  const [processCommit, setProcessCommit] = useState(false);
  const dryrunPayloadRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    BACKEND.get("/lsp-optimize")
      .then((response) => {
        dispatch({ type: "updateOptimizeHistory", payload: response.data.response });
      })
      .catch((err) => console.log(err));
  };

  const handleModalClose = () => {
    setModalShow(false);
    setDryrunResult(null);
    dryrunPayloadRef.current = null;
  };

  const handleDeleteOptimizeCommit = async () => {
    setProcessCommit(true);
    try {
      let payload = { ...dryrunPayloadRef.current.payload };
      payload.input["action-type"] = "commit";
      console.log("commit payload", payload);
      await WAE_API.post("/restconf/data/cisco-wae:networks/network=sr_sage/opm/lsps-to-reset:lsps-to-reset/run", payload);
      await BACKEND.delete(`/lsp-optimize/${dryrunPayloadRef.current.id}`);
      handleModalClose();
      fetchHistory();
    } catch (err) {
      console.log(err);
    }
    setProcessCommit(false);
  };

  const handleDeleteOptimizeDryrun = async (row) => {
    setModalShow(true);
    let payload = {
      input: {
        "action-type": "dry-run",
        "perform-opt-on": row["perform-opt-on"],
        "lsps-to-be-delete": row["re-routed-lsps"].map((el) => ({
          lspName: el.lspName,
          lspSrcNode: el.lspSrcNode,
          pathOption: el.futurePathOption,
        })),
      },
    };
    console.log("dryrun payload", payload);
    try {
      const response = await WAE_API.post(
        "/restconf/data/cisco-wae:networks/network=sr_sage/opm/lsps-to-reset:lsps-to-reset/run",
        payload,
      );
      dryrunPayloadRef.current = { payload, id: row._id };
      setDryrunResult(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const tableColumns = [
    {
      name: "time",
      sortable: true,
      cell: (row) => {
        const datetime = new Date(row.created_on);
        return datetime.toLocaleString("en-GB", { timeZone: "Asia/Bangkok" });
      },
      grow: 2,
      compact: true,
    },
    {
      name: "Num# LSP affected",
      sortable: true,
      cell: (row) => {
        return row["re-routed-lsps"].length;
      },
      grow: 1,
    },
    {
      name: "slice",
      selector: "perform-opt-on",
      sortable: true,
      grow: 2,
    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <span>
            <i className="fas fa-trash" onClick={() => handleDeleteOptimizeDryrun(row)} />
          </span>
        );
      },
      right: true,
      grow: 1,
      width: "20px",
    },
  ];

  return (
    <div className="h-100">
      <div>Optimization History</div>
      <div>
        <DataTable
          pagination
          paginationPerPage={20}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          dense
          noHeader
          pointerOnHover
          highlightOnHover
          defaultSortAsc={false}
          defaultSortField="created_on"
          columns={tableColumns}
          data={state.opHistory}
        />
      </div>
      <Modal size="lg" show={modalShow} onHide={handleModalClose} backdrop="static">
        <Modal.Body>
          {dryrunResult ? (
            <ShowDryRunResult result={dryrunResult["lsps-to-reset:output"].result} />
          ) : (
            <div>
              Calculating dry-run result <Spinner animation="grow" size="sm" variant="danger" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-sm" onClick={handleModalClose}>
            Close
          </button>
          <button
            className="btn btn-sm btn-primary"
            disabled={processCommit || !dryrunResult}
            onClick={handleDeleteOptimizeCommit}
          >
            {processCommit ? <Spinner animation="grow" size="sm" variant="light" /> : "Commit"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OptimizationHistory;
