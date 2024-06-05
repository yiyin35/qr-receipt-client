import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { useNavigate } from "react-router-dom";

function Item() {
  let { barcodeNum } = useParams();
  const [itemObject, setItemObject] = useState({});
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    // if (!authState.status)
    if (!localStorage.getItem("accessToken")) navigate("/login");
    else {
      axios
        .get(`https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory/byBarcodeNum/${barcodeNum}`)
        .then((response) => {
          setItemObject(response.data);
        });
    }
  }, []);

  const updateItem = (id) => {
    navigate(`/updateItem/${id}`);
  };

  const deleteItem = (id, imageName) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) {
      return;
    }

    axios
      .delete(`https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory/byBarcodeNum/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((response) => {
        alert(response.data);

        // remove image from server
        axios
          .delete(`https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory/deleteImage/${imageName}`, {
            headers: { accessToken: localStorage.getItem("accessToken") },
          })
          .then(() => {
            console.log("Image deleted from server");
          })
          .catch((error) => {
            console.error("Error deleting image from server:", error);
          });

        // navigate("/inventoryList");
        navigate("/");
      });
  };

  const formatDate = (rawDate) => {
    // return new Date(rawDate).toLocaleString("en-US", { timeZone: "UTC" });

    const date = new Date(rawDate);
    const options = { timeZone: "Asia/Singapore" }; // Specify the desired time zone
    return date.toLocaleString("en-US", options);
  };

  const convertExpiryDate = (expiryDate) => {
    const dateObj = new Date(expiryDate);
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="createOuterDiv">
        <div className="displayForm">
          <div className="createFormContent">
            <h2 className="loginTitle">Inventory Details</h2>

            {itemObject.image && (
              <div className="fieldRowDisplay">
                <div className="itemImageOuterDiv">
                  <div className="itemImageDiv">
                    <img
                      src={`https://qr-receipt-ddba1cd2d186.herokuapp.com/images/${itemObject.image}`}
                      alt={`${itemObject.itemName}_Image`}
                      className="itemImage"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="fieldRowDisplay">
              <label className="fieldLabel">Barcode Number: </label>
              <div className="fieldInputCol">
                <div className="fieldInputDisplay">
                  <div>{itemObject.barcodeNum}</div>
                </div>
              </div>
            </div>

            <div className="fieldRowDisplay">
              <label className="fieldLabel">Item Name: </label>
              <div className="fieldInputCol">
                <div className="fieldInputDisplay">
                  <div>{itemObject.itemName}</div>
                </div>
              </div>
            </div>

            <div className="fieldRowDisplay">
              <label className="fieldLabel">Quantity: </label>
              <div className="fieldInputCol">
                <div className="fieldInputDisplay">
                  <div>{itemObject.quantity}</div>
                </div>
              </div>
            </div>

            <div className="fieldRowDisplay">
              <label className="fieldLabel">Price: </label>
              <div className="fieldInputCol">
                <div className="fieldInputDisplay">
                  <div>RM {parseFloat(itemObject.price).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="fieldRowDisplay">
              <label className="fieldLabel">Batch Number: </label>
              <div className="fieldInputCol">
                <div className="fieldInputDisplay">
                  <div>{itemObject.batchNum}</div>
                </div>
              </div>
            </div>

            {itemObject.expiryDate !== null && (
              <div className="fieldRowDisplay">
                <label className="fieldLabel">Expiry Date: </label>
                <div className="fieldInputCol">
                  <div className="fieldInputDisplay">
                    <div>{convertExpiryDate(itemObject.expiryDate)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="fieldRowDisplay">
              <label className="fieldLabel">Category: </label>
              <div className="fieldInputCol">
                <div className="fieldInputDisplay">
                  <div>{itemObject.category}</div>
                </div>
              </div>
            </div>

            {/* IN PROGRESS - to change date format */}
            <div className="dateTimeInfoDiv">
              <div className="fieldRowDisplay">
                <label className="fieldLabelDateTime grayText">
                  Created at:
                </label>
                <div className="fieldInputCol">
                  <div className="fieldDateTimeDisplay grayText">
                    <div>
                      {formatDate(itemObject.createdAt)} by {itemObject.userId}
                    </div>
                  </div>
                </div>
              </div>
              <div className="fieldRowDisplay">
                <label className="fieldLabelDateTime grayText">
                  Updated at:
                </label>
                <div className="fieldInputCol">
                  <div className="fieldDateTimeDisplay grayText">
                    <div>
                      {formatDate(itemObject.updatedAt)} by{" "}
                      {itemObject.updatedBy}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {authState.status && (
              <div className="itemDetailBtnDiv">
                {authState.role === "Admin" && (
                  <>
                    <button
                      className="updateBtn btn"
                      onClick={() => {
                        updateItem(barcodeNum);
                      }}
                    >
                      Update
                    </button>

                    <button
                      className="deleteBtn btn"
                      onClick={() => {
                        deleteItem(barcodeNum, itemObject.image);
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}

                <div
                  onClick={() => {
                    // navigate("/inventoryList");
                    navigate("/");
                  }}
                >
                  <button className="cancelBtn btn">Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Item;
