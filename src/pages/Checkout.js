import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";
import { saveAs } from "file-saver";
import DropdownSearchBar from "../components/DropdownSearchBar";
import QrCode from "../components/QrCode";
import html2canvas from "html2canvas";
import { FaRegTrashAlt } from "react-icons/fa";
import { retailInfo } from "../helpers/RetailStoreDetails";
import { Anchor } from "antd";

function Checkout() {
  const today = new Date();
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  const [listOfInventory, setListOfInventory] = useState([]);
  const [selectedBarcodeNum, setSelectedBarcodeNum] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemPrice, setSelectedItemPrice] = useState(0.0);
  const [selectedItemStockQty, setSelectedItemStockQty] = useState(0); // update
  const [validStock, setValidStock] = useState(true); // update
  const [qtyDetail, setQtyDetail] = useState({
    qty: 0,
    totalPrice: 0.0,
  });
  const [checkoutList, setCheckoutList] = useState([]);
  const [totalReceipt, setTotalReceipt] = useState(0.0);
  const [image, setImage] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState(false);
  const [pdfInfo, setPdfInfo] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    receiptId: "",
    cashierName: "",
    // listOfItems: [],
    totalPrice: 0.0,
    totalItem: 0,
    qrImage: "",
    item1: {},
    item2: {},
    item3: {},
    item4: {},
    item5: {},
    item6: {},
    item7: {},
    item8: {},
    item9: {},
    item10: {},
    storeName: retailInfo.storeName,
    storeEmail: retailInfo.storeEmail,
    storeAddress: retailInfo.storeAddress,
  });
  let pdfData = pdfInfo;
  const [qrString, setQrString] = useState("");
  const [isQrImageGenerated, setIsQrImageGenerated] = useState(false);
  const [isQrImageSaved, setIsQrImageSaved] = useState(false);
  const qrCodeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [purchasedItemInfo, setPurchasedItemInfo] = useState("");

  useEffect(() => {
    // if (!authState.status)
    if (!localStorage.getItem("accessToken")) navigate("/login");
    else {
      axios
        .get("https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          setListOfInventory(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching inventory:", error);
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    // Calculate the available quantity of the selected item in stock
    const availableQty =
      selectedItemStockQty - getReservedQty(selectedBarcodeNum);

    // Check if the default quantity exceeds the available stock
    if (qtyDetail.qty > availableQty) {
      setValidStock(false);
      alert(
        "Please check if the items in the checkout list have reached the maximum available stock limit."
      );
    } else {
      setValidStock(true);
    }
  }, [selectedItemStockQty, selectedBarcodeNum]);

  useEffect(() => {
    if (checkoutStatus) {
      const generateAndSaveQrCode = async () => {
        try {
          const qrCodeElement = qrCodeRef.current;
          if (!qrCodeElement) throw new Error("QR code element not found");

          const canvas = await html2canvas(qrCodeElement);
          const dataUrl = canvas.toDataURL("image/png");

          // Update the image state
          setImage(dataUrl);
          setIsQrImageGenerated(true);
        } catch (error) {
          console.error(
            "Error generating or saving QR code image:",
            error.message
          );
        }
      };

      generateAndSaveQrCode();
    }
  }, [checkoutStatus]);

  const handleBarcodeSelect = (event) => {
    const selectedValue = event;
    // const selectedValue = event.target.value;
    setSelectedBarcodeNum(selectedValue);

    const selectedItem = listOfInventory.find(
      (item) => item.barcodeNum === selectedValue
    );
    if (selectedItem) {
      setSelectedItemName(selectedItem.itemName);
      setSelectedItemPrice(selectedItem.price);
      setSelectedItemStockQty(selectedItem.quantity);
      setQtyDetail({
        qty: 1,
        totalPrice: selectedItem.price,
      });
    }
  };

  const handleItemSelect = (event) => {
    const selectedValue = event;
    setSelectedItemName(selectedValue);

    const selectedItem = listOfInventory.find(
      (item) => item.itemName === selectedValue
    );
    if (selectedItem) {
      setSelectedBarcodeNum(selectedItem.barcodeNum);
      setSelectedItemPrice(selectedItem.price);
      setSelectedItemStockQty(selectedItem.quantity);
      setQtyDetail({
        qty: 1,
        totalPrice: selectedItem.price,
      });
    }
  };

  // reserve items (db remain) after being added into checkout list (but yet to be confirmed) to prevent overselling beyond available stock
  const markItemAsReserved = (barcodeNum, qtyToReserve) => {
    const updatedInventory = listOfInventory.map((item) => {
      if (item.barcodeNum === barcodeNum) {
        return {
          ...item,
          reservedQty: item.reservedQty + qtyToReserve,
        };
      }
      return item;
    });
    setListOfInventory(updatedInventory);
  };

  const getReservedQty = (barcodeNum) => {
    const itemsWithBarcodeNum = checkoutList.filter(
      (item) => item.barcodeNum === barcodeNum
    );

    const reservedQty = itemsWithBarcodeNum.reduce(
      (total, item) => total + item.totalQty,
      0
    );

    return reservedQty;
  };

  const addToCheckoutList = (barcodeNum) => {
    const checkoutItemIndex = checkoutList.findIndex(
      (item) => item.barcodeNum === barcodeNum
    );

    const checkoutItem = listOfInventory.find(
      (item) => item.barcodeNum === barcodeNum
    );

    const totalQtyToAdd = parseInt(qtyDetail.qty);

    if (checkoutItemIndex !== -1) {
      // update quantity if item already exists in checkoutList
      const updatedCheckoutList = [...checkoutList];
      updatedCheckoutList[checkoutItemIndex].totalQty += totalQtyToAdd;
      updatedCheckoutList[checkoutItemIndex].totalPrice += qtyDetail.totalPrice;
      setCheckoutList(updatedCheckoutList);
    } else if (checkoutItem) {
      markItemAsReserved(checkoutItem.barcodeNum, totalQtyToAdd); // ADDED

      setCheckoutList([
        ...checkoutList,
        {
          barcodeNum: checkoutItem.barcodeNum,
          itemName: checkoutItem.itemName,
          price: checkoutItem.price,
          batchNum: checkoutItem.batchNum,
          category: checkoutItem.category,
          expiryDate: checkoutItem.expiryDate,
          // totalQty: qtyDetail.qty,
          totalQty: totalQtyToAdd,
          totalPrice: qtyDetail.totalPrice,
        },
      ]);
    }

    // const checkoutItem = listOfInventory.find(
    //   (item) => item.barcodeNum === barcodeNum
    // );

    // if (checkoutItem)
    //   setCheckoutList([
    //     ...checkoutList,
    //     {
    //       barcodeNum: checkoutItem.barcodeNum,
    //       itemName: checkoutItem.itemName,
    //       // quantity: checkoutItem.quantity,
    //       price: checkoutItem.price,
    //       batchNum: checkoutItem.batchNum,
    //       category: checkoutItem.category,
    //       expiryDate: checkoutItem.expiryDate,
    //       totalQty: qtyDetail.qty,
    //       totalPrice: qtyDetail.totalPrice,
    //     },
    //   ]);

    setTotalReceipt(totalReceipt + qtyDetail.totalPrice);
    setSelectedBarcodeNum("");
    setSelectedItemName("");
    setSelectedItemPrice("");
    setSelectedItemStockQty("");
    setQtyDetail({ qty: 0, totalPrice: 0 });
  };

  const handleInputQty = (event) => {
    const inputQty = event.target.value;

    const availableQty =
      selectedItemStockQty - getReservedQty(selectedBarcodeNum); // ADDED

    setQtyDetail({ qty: inputQty, totalPrice: selectedItemPrice * inputQty });

    // check checkout qty does not exceed in-stock qty
    // if (inputQty <= selectedItemStockQty) setValidStock(true); // VER 1
    if (inputQty <= availableQty) setValidStock(true); // VER 2
    else setValidStock(false);
  };

  const generateDate = () => {
    const today = new Date();
    const date = `${today.getDate()}-${
      today.getMonth() + 1
    }-${today.getFullYear()}`;

    return date;
  };

  const generateTime = () => {
    const currentDate = new Date();
    const gmtTime = new Date(
      currentDate.getTime() + (8 * 60 + currentDate.getTimezoneOffset()) * 60000
    );
    const hours = String(gmtTime.getHours()).padStart(2, "0");
    const minutes = String(gmtTime.getMinutes()).padStart(2, "0");
    const seconds = String(gmtTime.getSeconds()).padStart(2, "0");

    const time = `${hours}:${minutes}:${seconds}`;

    return time;
  };

  const generateReceiptId = () => {
    const currentDate = new Date(); // Get current date and time
    // const formattedDate = currentDate.toISOString().replace(/[-T:.Z]/g, ""); // Format date and time (YYYYMMDDHHMMSS)
    // const randomNum1 = Math.floor(Math.random() * 100); // Generate a random number between 0 and 99
    // const receiptId = formattedDate + randomNum1;
    const gmtTime = new Date(
      currentDate.getTime() + (8 * 60 + currentDate.getTimezoneOffset()) * 60000
    ); // Adjust time to GMT+8
    const year = gmtTime.getFullYear();
    const month = String(gmtTime.getMonth() + 1).padStart(2, "0");
    const date = String(gmtTime.getDate()).padStart(2, "0");
    const hours = String(gmtTime.getHours()).padStart(2, "0");
    const minutes = String(gmtTime.getMinutes()).padStart(2, "0");
    const seconds = String(gmtTime.getSeconds()).padStart(2, "0");
    const formattedDate = `${year}${month}${date}${hours}${minutes}${seconds}`; // Format date and time (YYYYMMDDHHMMSS)
    const randomNum1 = Math.floor(Math.random() * 90) + 10; // Generate a random number between 10 to 99
    const receiptId = formattedDate + randomNum1;

    return receiptId;
  };

  // FOR TESTING *******
  const generateTestReceipt = (type) => {
    const testDay = "25";
    const testMonth = "12";
    const testYear = "2023";

    const testDate = `${testDay}-${testMonth}-${testYear}`;

    if (type === "date") return testDate;
    else if (type === "receiptId") {
      const currentDate = new Date();
      const gmtTime = new Date(
        currentDate.getTime() +
          (8 * 60 + currentDate.getTimezoneOffset()) * 60000
      );
      const formattedTestDay = testDay.padStart(2, "0");
      const formattedTestMonth = testMonth.padStart(2, "0");

      const hours = String(gmtTime.getHours()).padStart(2, "0");
      const minutes = String(gmtTime.getMinutes()).padStart(2, "0");
      const seconds = String(gmtTime.getSeconds()).padStart(2, "0");
      const formattedDate = `${testYear}${formattedTestMonth}${formattedTestDay}${hours}${minutes}${seconds}`;
      // const randomNum1 = Math.floor(Math.random() * 90) + 10;
      const randomNum = Math.floor(Math.random() * 99) + 1;
      const formattedNum = randomNum.toString().padStart(2, "0");
      const receiptId = formattedDate + formattedNum;

      return receiptId;
    }
  };

  // const confirmCheckout = () => {
  const confirmCheckout = async () => {
    setCheckoutStatus(true);

    // ACTUAL *******
    const trxDate = generateDate();
    const trxId = generateReceiptId();

    // FOR TESTING *******
    // const trxDate = generateTestReceipt("date");
    // const trxId = generateTestReceipt("receiptId");

    setPdfInfo({
      ...pdfInfo,
      time: generateTime(),
      date: trxDate,
      receiptId: trxId,
      cashierName: authState.userId, // username removed
      // listOfItems: checkoutList, // removed
      totalPrice: totalReceipt,
      totalItem: checkoutList.length,
      item1: checkoutList.length >= 1 ? checkoutList[0] : {},
      item2: checkoutList.length >= 2 ? checkoutList[1] : {},
      item3: checkoutList.length >= 3 ? checkoutList[2] : {},
      item4: checkoutList.length >= 4 ? checkoutList[3] : {},
      item5: checkoutList.length >= 5 ? checkoutList[4] : {},
      item6: checkoutList.length >= 6 ? checkoutList[5] : {},
      item7: checkoutList.length >= 7 ? checkoutList[6] : {},
      item8: checkoutList.length >= 8 ? checkoutList[7] : {},
      item9: checkoutList.length >= 9 ? checkoutList[8] : {},
      item10: checkoutList.length >= 10 ? checkoutList[9] : {},
    });

    const selectedFieldAsString = checkoutList
      .map((value, key) => {
        const { itemName, expiryDate, totalQty, category } = value;

        if (expiryDate === null)
          return `${itemName}, -, ${totalQty}, ${category}`;
        else return `${itemName}, ${expiryDate}, ${totalQty}, ${category}`;
      })
      .join("\n");

    const completedString =
      trxDate +
      "\n" +
      trxId +
      "\n" +
      totalReceipt.toFixed(2) +
      "\n" +
      selectedFieldAsString;

    const purchasedItemInfoString = checkoutList
      .map((value, key) => {
        const { itemName, totalQty, totalPrice } = value;

        return `${itemName}, ${totalQty}, ${totalPrice}`;
      })
      .join("; ");

    setQrString(completedString);
    setPurchasedItemInfo(purchasedItemInfoString);
  };

  const submitPdfForm = async (e) => {
    e.preventDefault();

    // don't send email if QR code not generated successfully
    if (!isQrImageSaved) {
      alert("QR code not downloaded successfully. PDF will not be sent.");
      return;
    }

    updateQuantityDB(); // 26/3
    saveTrxToDb(); // 23/3

    await axios
      .post(
        `https://qr-receipt-ddba1cd2d186.herokuapp.com/pdf/createPdf`,
        pdfData
      ) // data
      .then(() => {
        axios
          .get(`https://qr-receipt-ddba1cd2d186.herokuapp.com/pdf/fetchPdf`, {
            responseType: "blob",
          })
          .then((res) => {
            const pdfBlob = new Blob([res.data], {
              type: "application/pdf", // data
            }); // use file saver to save
            saveAs(pdfBlob, "InvoiceDocument.pdf");

            // clear state after downloading
            setPdfInfo({
              ...pdfInfo,
              name: "",
              email: "",
              date: "",
              time: "",
              receiptId: "",
              cashierName: "",
              totalPrice: 0.0,
              qrImage: "",
              item1: {},
              item2: {},
              item3: {},
              item4: {},
              item5: {},
              item6: {},
              item7: {},
              item8: {},
              item9: {},
              item10: {},
            });
            setCheckoutStatus(false);
          })
          .then(() => {
            axios
              .post(
                `https://qr-receipt-ddba1cd2d186.herokuapp.com/pdf/sendPdf`,
                {
                  email: pdfData.email, // data
                  receiptId: pdfData.receiptId,
                  storeName: retailInfo.storeName,
                  storeEmail: retailInfo.storeEmail,
                }
              )
              .then((response) => {
                console.log(response);
                alert(response.data); // data
              });
          });
      });

    setCheckoutList([]); // reset
    setTotalReceipt(0.0);
  };

  // const downloadQr = async () => {
  //   try {
  //     const qrCodeElement = qrCodeRef.current;
  //     if (!qrCodeElement) throw new Error("QR code element not found");

  //     const canvas = await html2canvas(qrCodeElement);
  //     const dataUrl = canvas.toDataURL("image/png");

  //     // Update the image state
  //     setImage(dataUrl);
  //     setIsQrImageGenerated(true); // Set the flag to true after image generation
  //   } catch (error) {
  //     console.error("Error generating or saving QR code image:", error.message);
  //   }
  // };

  useEffect(() => {
    // Check if the image is generated and the pdfInfo is updated
    if (isQrImageGenerated && image !== "") {
      // Update the pdfInfo state with the generated image
      setPdfInfo({ ...pdfInfo, qrImage: image });

      // Send the PNG data to the backend to save it
      axios
        .post(
          `https://qr-receipt-ddba1cd2d186.herokuapp.com/qr/createQr`,
          { imageData: image },
          { responseType: "blob" } // Specify the response type as blob
        )
        .then(() => {
          console.log("Image file saved to the server");
          setIsQrImageSaved(true);
        })
        .catch((error) => {
          console.error(
            "Error saving QR code image to the server:",
            error.message
          );
        });

      // Reset the flag variable to prevent infinite loop
      setIsQrImageGenerated(false);
    }
  }, [isQrImageGenerated, image, pdfInfo]);

  // TRANSACTION table - added on 23/3
  const saveTrxToDb = () => {
    const dateParts = pdfData.date.split("-");
    const formattedDate = `${dateParts[2]}-${parseInt(dateParts[1])}-${
      dateParts[0]
    }`;
    const combinedDateTime = `${formattedDate} ${pdfData.time}`;

    const data = {
      trxId: pdfData.receiptId,
      userId: pdfData.cashierName,
      trxDateTime: combinedDateTime,
      totalTrxAmount: pdfData.totalPrice,
      purchasedItemInfo: purchasedItemInfo,
      customerName: pdfData.name,
      customerEmail: pdfData.email,
    };

    axios
      .post("https://qr-receipt-ddba1cd2d186.herokuapp.com/checkout", data, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((response) => {
        console.log(response); // CHECK
      });
  };

  const removeFromCheckoutList = (index) => {
    const updatedCheckoutList = [...checkoutList];
    updatedCheckoutList.splice(index, 1);
    setCheckoutList(updatedCheckoutList);
    setTotalReceipt(totalReceipt - checkoutList[index].totalPrice); // Deduct removed item's price from total receipt
    setCheckoutStatus(false); // force user to reconfirm checkout
  };

  const updateQuantityDB = () => {
    checkoutList.forEach((listItem) => {
      var selectedItem = listOfInventory.find(
        (item) => item.barcodeNum === listItem.barcodeNum
      );

      if (selectedItem) {
        const updatedQuantity = selectedItem.quantity - listItem.totalQty;

        console.log("selectedItem", selectedItem); // -check
        console.log("selectedItem.quantity", selectedItem.quantity); // -check
        console.log("listItem.totalQty", listItem.totalQty); // -check
        console.log("updatedQuantity", updatedQuantity); // -check

        axios
          .put(
            `https://qr-receipt-ddba1cd2d186.herokuapp.com/checkout`,
            { barcodeNum: selectedItem.barcodeNum, qty: updatedQuantity },
            {
              headers: { accessToken: localStorage.getItem("accessToken") },
            }
          )
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.error("Error updating quantity:", error);
          });
      }
    });
  };

  const handleAnchor = (e, link) => {
    e.preventDefault();
  };

  return (
    <div>
      {loading ? (
        <div className="noRecordContainer">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {listOfInventory.length === 0 ? (
            <div className="noRecordContainer">
              <h4>No inventory items found for checkout.</h4>
              <div>
                Click <Link to="/addNewItem">here</Link> to add new inventory.
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="checkoutOuterDiv">
                  <div className="displayForm">
                    <div className="createFormContent">
                      <h2 className="loginTitle">Checkout</h2>

                      <div>
                        <div>
                          <div className="itemCard">
                            {/* ---------- Searchable dropdown ---------- */}
                            <div className="field">
                              <label className="fieldLabel">
                                Barcode Number:
                              </label>
                              <div className="fieldInputCol">
                                <div className="fieldInput">
                                  <div>
                                    <DropdownSearchBar
                                      options={listOfInventory}
                                      id="barcodeNum"
                                      label="barcodeNum"
                                      selectedVal={selectedBarcodeNum}
                                      handleChange={handleBarcodeSelect}
                                      // selectedVal={value} // event.target.value
                                      // handleChange={(val) => setValue(val)} // event.target.value
                                      className="fieldInput"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="field">
                              <label className="fieldLabel">Item Name: </label>
                              <div className="fieldInputCol">
                                <div className="fieldInput">
                                  <div>
                                    <DropdownSearchBar
                                      options={listOfInventory}
                                      id="barcodeNum"
                                      label="itemName"
                                      selectedVal={selectedItemName}
                                      handleChange={handleItemSelect}
                                      // selectedVal={value} // event.target.value
                                      // handleChange={(val) => setValue(val)} // event.target.value
                                      className="fieldInput"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="field">
                              <label className="fieldLabel">Price:</label>
                              <div className="fieldInputCol">
                                <div className="fieldInput">
                                  <div className="checkoutPriceDiv">
                                    {selectedItemPrice ? (
                                      <label value={selectedItemPrice}>
                                        RM{" "}
                                        {parseFloat(selectedItemPrice).toFixed(
                                          2
                                        )}
                                      </label>
                                    ) : (
                                      <label>-</label>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="field">
                              <label className="fieldLabel">Quantity:</label>
                              <div className="fieldInputCol">
                                <div className="fieldInput">
                                  <div className="checkoutQtyDiv">
                                    <input
                                      className="checkoutQtyInputField"
                                      type="number"
                                      min={
                                        selectedBarcodeNum || selectedItemName
                                          ? "1"
                                          : "0"
                                      }
                                      max={
                                        selectedBarcodeNum || selectedItemName
                                          ? `${selectedItemStockQty}`
                                          : "0"
                                      }
                                      step="1"
                                      value={qtyDetail.qty}
                                      onChange={handleInputQty}
                                      placeholder="0"
                                    />
                                  </div>
                                  {!validStock && (
                                    <div>
                                      <span className="err">
                                        {selectedItemStockQty} items in stock
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="field">
                              <label className="fieldLabel">Total Price:</label>
                              <div className="fieldInputCol">
                                <div className="fieldInput">
                                  <div className="checkoutPriceDiv">
                                    {qtyDetail.qty ? (
                                      <label value={selectedItemPrice}>
                                        RM {qtyDetail.totalPrice.toFixed(2)}
                                      </label>
                                    ) : (
                                      <label>-</label>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {
                          // (selectedBarcodeNum || selectedItemName) &&
                          checkoutList.length < 10 && (
                            <div className="loginBtnDiv">
                              <button
                                className="createBtn btn"
                                onClick={() => {
                                  qtyDetail.qty > 0 &&
                                    validStock &&
                                    addToCheckoutList(selectedBarcodeNum); // add to list only if qty > 0
                                  setCheckoutStatus(false);
                                }}
                                disabled={
                                  !selectedBarcodeNum || !selectedItemName
                                }
                              >
                                Add to Cart
                              </button>
                            </div>
                          )
                        }

                        {(selectedBarcodeNum || selectedItemName) &&
                          checkoutList.length >= 10 && (
                            <div>
                              <span>
                                *You have reached the maximum limit of 10
                                checkout items.*
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY */}
                  {totalReceipt > 0 && (
                    <div>
                      <div className="summaryDiv" id="summaryDiv">
                        <div className="summaryInnerDiv">
                          <h3>Summary</h3>

                          <div>
                            <div className="summaryItemOuterDiv">
                              <table className="summaryTable">
                                <thead>
                                  <tr>
                                    <th className="checkoutNumField">#</th>
                                    <th className="itemField">Item</th>
                                    <th className="priceField">Price</th>
                                    <th className="qtyField">Qty</th>
                                    <th className="totalField">Total</th>
                                    <th className="removeField">Remove</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {checkoutList.map((value, key) => {
                                    return (
                                      <tr>
                                        <td className="tableField checkoutNumField">
                                          {key + 1}
                                        </td>
                                        <td className="tableField itemField">
                                          {value.itemName}
                                        </td>
                                        <td className="tableField priceField">
                                          RM
                                          {parseFloat(value.price).toFixed(2)}
                                        </td>
                                        <td className="tableField qtyField">
                                          x{value.totalQty}
                                        </td>
                                        <td className="tableField totalField">
                                          RM{value.totalPrice.toFixed(2)}
                                        </td>
                                        <td className="tableField removeField">
                                          <div
                                            onClick={() =>
                                              removeFromCheckoutList(key)
                                            }
                                          >
                                            <FaRegTrashAlt className="removeFromListIcon" />
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}

                                  <tr>
                                    <td className="lastRow"></td>
                                    <td className="lastRow"></td>
                                    <td className="lastRow subtotalTitle">
                                      Subtotal:
                                    </td>
                                    <td className="lastRow"></td>
                                    <td className="lastRow subtotalValue">
                                      RM{totalReceipt.toFixed(2)}
                                    </td>
                                    <td className="lastRow"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="loginBtnDiv" id="confirmCheckoutBtn">
                          <button
                            onClick={confirmCheckout}
                            className="checkoutBtn btn"
                          >
                            <Anchor
                              className="anchor"
                              affix={false}
                              onClick={(e) => handleAnchor(e, "#qrContainer")}
                              items={[
                                {
                                  // key: "qrContainer",
                                  title: "Confirm Checkout",
                                  href: "#confirmCheckoutBtn",
                                },
                              ]}
                              direction="horizontal"
                            />

                            {/* <Anchor
                            className="anchor"
                            affix={false}
                            onClick={(e, link) => {
                              handleAnchor(e, link.href);
                              confirmCheckout();
                            }}
                            direction="horizontal"
                          >
                            <a
                              href="#confirmCheckoutBtn"
                              className="checkoutBtn btn"
                              id="confirmCheckoutBtn"
                            >
                              Confirm Checkout
                            </a>
                          </Anchor> */}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF GENERATION */}
                  {totalReceipt > 0 && checkoutStatus && (
                    <div className="receiptOuterDiv">
                      <div className="receiptDiv">
                        <h3 className="sendReceiptDiv">
                          Send Receipt to Customer's Email
                        </h3>

                        <div>
                          <div>
                            <div
                              ref={qrCodeRef}
                              className="qrContainer"
                              id="qrContainer"
                            >
                              <QrCode
                                id="qrcode"
                                qrInfo={`${qrString}`.toString()} // store only required data
                              />
                            </div>
                            {/* <button className="" onClick={downloadQr}>
                                Download QR
                              </button> */}
                          </div>

                          <div className="customerDetailsContainer">
                            <form onSubmit={submitPdfForm}>
                              <div className="contactInputDiv">
                                <div className="field">
                                  <label className="contactFieldLabel">
                                    Customer Name:
                                  </label>
                                  <div className="fieldInputCol">
                                    <div className="fieldInput">
                                      <input
                                        type="text"
                                        placeholder="Name"
                                        name="name"
                                        value={pdfInfo.name}
                                        onChange={(e) => {
                                          setPdfInfo({
                                            ...pdfInfo,
                                            name: e.target.value,
                                          });
                                        }}
                                        required
                                        className="createTextInput textInput"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="field">
                                  <label className="contactFieldLabel">
                                    Customer Email:
                                  </label>
                                  <div className="fieldInputCol">
                                    <div className="fieldInput">
                                      <input
                                        type="email"
                                        placeholder="Email"
                                        name="email"
                                        value={pdfInfo.email}
                                        onChange={(e) => {
                                          setPdfInfo({
                                            ...pdfInfo,
                                            email: e.target.value,
                                          });
                                        }}
                                        required
                                        className="createTextInput textInput"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="loginBtnDiv">
                                <button className="checkoutBtn btn">
                                  Send Receipt
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Checkout;
