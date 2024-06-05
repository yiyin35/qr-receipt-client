import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import SearchBar from "../components/SearchBar";
import { BsGrid } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";

export const itemCategory = [
  "Medications",
  "Healthcare Products",
  "Personal Care Products",
  "Home Health Aids",
  "Baby and Childcare Products",
  "Specialty Products",
];

function Inventory() {
  const [listOfInventory, setListOfInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewBy, setViewBy] = useState("list");

  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    // if (!authState.status)
    if (!localStorage.getItem("accessToken")) navigate("/login");
    else {
      axios
        .get("http://localhost:3001/inventory", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          setListOfInventory(response.data);
          setFilteredInventory(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching inventory:", error);
          setLoading(false);
        });
    }
  }, []);

  const handleSearch = (searchTerm) => {
    const filtered = listOfInventory.filter(
      (item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcodeNum.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  };

  return (
    <div className="Inventory">
      {loading ? (
        <div className="noRecordContainer">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {listOfInventory.length === 0 ? (
            <div className="noRecordContainer">
              <h4>No inventory items found.</h4>
              <div>
                Click <Link to="/addNewItem">here</Link> to add new inventory.
              </div>
            </div>
          ) : (
            <>
              <div className="searchDiv">
                <h2 className="pageTitle">All Inventories</h2>

                <div className="searchRow">
                  <div className="searchInputOuter">
                    <label className="searchByText">
                      Search Item Name / Barcode Number:{" "}
                    </label>
                    <div className="searchInputDiv">
                      <SearchBar
                        handleSearch={handleSearch}
                        placeholder="default"
                      />
                    </div>
                  </div>

                  <div className="viewByDiv">
                    <div className="viewByInnerDiv">
                      <div
                        className="leftIconDiv"
                        onClick={() => {
                          setViewBy("list");
                        }}
                      >
                        <FaListUl
                          className={
                            viewBy === "list"
                              ? "viewByIcon"
                              : "viewByIcon inactiveIcon"
                          }
                        />
                      </div>
                      <div
                        className="rightIconDiv"
                        onClick={() => {
                          setViewBy("grid");
                        }}
                      >
                        <BsGrid
                          className={
                            viewBy === "grid"
                              ? "viewByIcon"
                              : "viewByIcon inactiveIcon"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {filteredInventory.length > 0 ? (
                <>
                  {viewBy === "grid" && (
                    <div className="outerContainer">
                      {/* {listOfInventory.map((value, key) => { */}
                      {filteredInventory.map((value, key) => {
                        return (
                          <div className="itemContainer">
                            <div
                              className="itemContent"
                              onClick={() => {
                                navigate(`/item/${value.barcodeNum}`);
                              }}
                            >
                              <div className="itemImageCardDiv">
                                <img
                                  src={`http://localhost:3001/images/${value.image}`}
                                  alt={`${value.itemName}_Image`}
                                  className="itemImageCard"
                                />
                              </div>
                              <div className="itemRow">{value.barcodeNum}</div>
                              <div className="itemRow">{value.itemName}</div>
                              <div className="itemRow">
                                RM {parseFloat(value.price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {viewBy === "list" && (
                    <div className="trxHistoryDiv">
                      <div className="summaryInnerDiv">
                        {/* <h2 className="trxHistoryTitle">Transaction History</h2> */}

                        <div>
                          <div className="summaryItemOuterDiv">
                            <table className="trxHistoryTable">
                              <thead>
                                <tr>
                                  <th className="itemNumField">#</th>
                                  <th className="barcodeNumField">
                                    Barcode Number
                                  </th>
                                  <th className="itemImgField">Item</th>
                                  <th className="itemNameField">Name</th>
                                  <th className="itemQtyField">In Stock</th>
                                  <th className="itemPriceField">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredInventory.map((value, key) => {
                                  return (
                                    <tr
                                      className="trxHistoryDataRow"
                                      onClick={() => {
                                        navigate(`/item/${value.barcodeNum}`);
                                      }}
                                    >
                                      <td className="trxTableField itemNumField">
                                        {key + 1}
                                      </td>
                                      <td className="trxTableField barcodeNumField">
                                        {value.barcodeNum}
                                      </td>
                                      <td className="itemImgField">
                                        <div className="tableImgDiv">
                                          <img
                                            src={`http://localhost:3001/images/${value.image}`}
                                            alt={`${value.itemName}_Image`}
                                            className="itemImg"
                                          />
                                        </div>
                                      </td>
                                      <td className="trxTableField itemNameField">
                                        {value.itemName}
                                      </td>
                                      <td className="trxTableField itemQtyField">
                                        {value.quantity}
                                      </td>
                                      <td className="trxTableField itemPriceField">
                                        RM {parseFloat(value.price).toFixed(2)}
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
                  )}
                </>
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

export default Inventory;
