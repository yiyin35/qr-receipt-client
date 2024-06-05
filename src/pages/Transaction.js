import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { useNavigate } from "react-router-dom";

function Transaction() {
  let { trxId } = useParams();
  const [trxObject, setTrxObject] = useState({});
  const [itemList, setItemList] = useState([]);
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    // if (!authState.status)
    if (!localStorage.getItem("accessToken")) navigate("/login");
    else {
      axios
        .get(`https://qr-receipt-ddba1cd2d186.herokuapp.com/transactionHistory/byTrxId/${trxId}`)
        .then((response) => {
          setTrxObject(response.data);
          extractItems(response.data.purchasedItemInfo);
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

  const extractItems = (itemString) => {
    if (!itemString) return [];

    const itemsArray = itemString.split("; ");
    const items = [];

    itemsArray.forEach((item) => {
      const [name, quantity, totalPricePerItem] = item.split(", ");
      items.push({
        name: name.trim(),
        quantity: parseInt(quantity.match(/\d+/)[0]),
        totalPricePerItem: parseFloat(totalPricePerItem),
      });
    });

    setItemList(items);
  };

  return (
    <div>
      <div className="checkoutOuterDiv">
        <div className="displayForm">
          {/* <div className="trxRecordDiv"> */}
          <div className="trxRecordDiv">
            <h2 className="receiptHeader">Transaction Details</h2>

            <div className="receiptContentDiv">
              <div className="contentDiv1">
                <div className="receiptContentRow">
                  <label className="receiptContentLabel1">
                    Transaction ID:
                  </label>
                  <label className="receiptContentValue">
                    #{trxObject.trxId}
                  </label>
                </div>

                <div className="receiptContentRow">
                  <label className="receiptContentLabel1">Date:</label>
                  <label className="receiptContentValue">
                    {extractDateTime(trxObject.trxDateTime, "date")}
                    {/* {" "}{extractDateTime(trxObject.trxDateTime, "time")} */}
                  </label>
                </div>

                <div className="receiptContentRow">
                  <label className="receiptContentLabel1">Time:</label>
                  <label className="receiptContentValue">
                    {extractDateTime(trxObject.trxDateTime, "time")}
                  </label>
                </div>

                <div className="receiptContentRow">
                  <label className="receiptContentLabel1">Cashier:</label>
                  <label className="receiptContentValue">
                    {trxObject.userId}
                  </label>
                </div>
              </div>

              <div className="contentDiv2">
                <div className="receiptContentRow">
                  <label className="receiptContentLabel2">Customer Name:</label>
                  <label className="receiptContentValue">
                    {trxObject.customerName}
                  </label>
                </div>

                <div className="receiptContentRow">
                  <label className="receiptContentLabel2">
                    Customer Email:
                  </label>
                  <label className="receiptContentValue">
                    {trxObject.customerEmail}
                  </label>
                </div>
              </div>

              {/* IN PROGRESS */}
              <div className="contentDiv3">
                <table>
                  <thead>
                    <tr>
                      <th className="rcptNumField">#</th>
                      <th className="rcptItemField">Item</th>
                      <th className="rcptPriceField">Price</th>
                      <th className="rcptQtyField">Qty</th>
                      <th className="rcptTotalPriceField">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemList.map((value, key) => {
                      return (
                        <tr>
                          <td className="tableField rcptNumField">{key + 1}</td>
                          <td className="tableField rcptItemField">
                            {value.name}
                          </td>
                          <td className="tableField rcptPriceField">
                            RM{" "}
                            {parseFloat(
                              value.totalPricePerItem / value.quantity
                            ).toFixed(2)}
                          </td>
                          <td className="tableField rcptQtyField">
                            {value.quantity}
                          </td>
                          <td className="tableField rcptTotalPriceField">
                            RM {parseFloat(value.totalPricePerItem).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="lastRow"></td>
                      <td className="lastRow"></td>
                      <td className="lastRow subtotalRcptTitle">Subtotal:</td>
                      <td className="lastRow"></td>
                      <td className="lastRow subtotalValue">
                        RM{parseFloat(trxObject.totalTrxAmount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="itemDetailBtnDiv">
          <div
            onClick={() => {
              window.print();
            }}
          >
            <button className="cancelBtn btn">Print</button>
          </div>

          <div
            onClick={() => {
              navigate("/transactionHistory");
            }}
          >
            <button className="cancelBtn btn">Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transaction;
