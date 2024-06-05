import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { FaCircleInfo } from "react-icons/fa6";

function TransactionHistory() {
  const [loading, setLoading] = useState(true);
  const [listOfTransaction, setListOfTransaction] = useState([]);
  const [filteredTransaction, setFilteredTransaction] = useState([]);

  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    // if (!authState.status)
    if (!localStorage.getItem("accessToken")) navigate("/login");
    else {
      axios
        .get("http://localhost:3001/transactionHistory", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          setListOfTransaction(response.data);
          setFilteredTransaction(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching transaction record:", error);
          setLoading(false);
        });
    }
  }, []);

  const extractDateTime = (dateTime, type) => {
    const dateObj = new Date(dateTime);

    if (type === "date") {
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");
      const date = `${day}/${month}/${year}`;

      return date;
    }

    if (type === "time") {
      const hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const seconds = String(dateObj.getSeconds()).padStart(2, "0");
      const amPm = hours >= 12 ? "PM" : "AM";
      const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
      const time = `${formattedHours}:${minutes}:${seconds} ${amPm}`;

      return time;
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = listOfTransaction.filter((item) =>
      item.trxId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransaction(filtered);
  };

  return (
    <div className="TransactionHistory">
      {loading ? (
        <div className="noRecordContainer">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {listOfTransaction.length === 0 ? (
            <div className="noRecordContainer">
              <h4>No transaction records found.</h4>
            </div>
          ) : (
            <>
              <div className="searchDiv">
                <h2 className="pageTitle">Transaction History</h2>

                <div className="searchInputOuter">
                  <label className="searchByText">
                    Search Transaction ID:{" "}
                  </label>
                  <div className="searchInputDiv">
                    <SearchBar
                      handleSearch={handleSearch}
                      placeholder="YYYYMMDDHHMMSS"
                    />
                  </div>
                  <div>
                    <Tooltip anchorSelect=".infoIcon" place="top">
                      HHMMSS is in 24-hour format (15:30:00)
                    </Tooltip>
                    <div className="infoIconDiv">
                      <FaCircleInfo className="infoIcon" />
                    </div>
                  </div>
                </div>
              </div>

              {filteredTransaction.length > 0 ? (
                <div className="trxHistoryDiv">
                  <div className="summaryInnerDiv">
                    {/* <h2 className="trxHistoryTitle">Transaction History</h2> */}

                    <div>
                      <div className="summaryItemOuterDiv">
                        <table className="trxHistoryTable">
                          <thead>
                            <tr>
                              <th className="numField">#</th>
                              <th className="dateField">Date</th>
                              <th className="dateField">Time</th>
                              <th className="receiptIdField">Transaction ID</th>
                              <th className="cashierField">Cashier</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransaction.map((value, key) => {
                              return (
                                <tr
                                  className="trxHistoryDataRow"
                                  onClick={() => {
                                    navigate(`/transaction/${value.trxId}`);
                                  }}
                                >
                                  <td className="trxTableField numField">
                                    {key + 1}
                                  </td>
                                  <td className="trxTableField dateField">
                                    {extractDateTime(value.trxDateTime, "date")}
                                  </td>
                                  <td className="trxTableField dateField">
                                    {extractDateTime(value.trxDateTime, "time")}
                                  </td>
                                  <td className="trxTableField receiptIdField">
                                    {value.trxId}
                                  </td>
                                  <td className="trxTableField cashierField">
                                    {value.userId}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="noMatchSearchResult">No matching results.</div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default TransactionHistory;
