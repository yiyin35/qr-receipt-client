import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { itemCategory } from "./Inventory";

function CreateInventory() {
  const { authState } = useContext(AuthContext);
  const [expiryDate, setExpiryDate] = useState("");
  const [noExpiryDate, setNoExpiryDate] = useState(false);
  const [image, setImage] = useState("");
  const [listOfInventory, setListOfInventory] = useState([]);

  let navigate = useNavigate();

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
        })
        .catch((error) => {
          console.error("Error fetching inventory:", error);
        });
    }
  }, []);

  const initialValues = {
    barcodeNum: "",
    itemName: "",
    quantity: "", // 0
    price: "", // 0.00
    batchNum: "",
    expiryDate: "",
    category: "",
    image: "",
    userId: "",
    updatedBy: "",
  };

  const onSubmit = async (data) => {
    let validBarcodeNum = !listOfInventory.some(
      (value) => data.barcodeNum === value.barcodeNum
    );

    if (!validBarcodeNum) {
      alert("Item with the same barcode number already exists.");
      return; // Exit the function early if barcode number already exists
    }

    if (noExpiryDate) {
      data.expiryDate = null; // Set expiry date to null if item has no expiry date
    } else {
      data.expiryDate = expiryDate;
    }

    const formData = new FormData();
    formData.append("upload", image); // Append the image file to form data

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value); // Append other form data fields
    });

    const response = await axios.post(
      "https://qr-receipt-ddba1cd2d186.herokuapp.com/uploadImage",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accessToken: localStorage.getItem("accessToken"),
        },
      }
    );

    // added
    const imageUrl = response.data.imageUrl;
    data.image = imageUrl;
    // data.image = image.name;
    data.userId = authState.userId;
    data.updatedBy = authState.userId;

    axios
      .post("https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory", data, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((response) => {
        // navigate("/inventoryList");
        navigate("/");
      });
  };

  const validationSchema = Yup.object().shape({
    // barcodeNum: Yup.string().required("You must input a Barcode Number"),
    // itemName: Yup.string().required(),
    // quantity: Yup.number().required().positive().integer(),
    // price: Yup.number().required().positive(), // double
    // batchNum: Yup.string().required(),
    // // expiryDate: Yup.date().required(),
    // category: Yup.string().required(),
    // // photo: Yup.string().required(),

    // UPDATED @ 23/3 - added required on input field
    barcodeNum: Yup.string(),
    itemName: Yup.string(),
    quantity: Yup.number().positive().integer(),
    price: Yup.number().positive(), // double
    batchNum: Yup.string(),
    category: Yup.string(),
  });

  const invalidRoute = () => {
    navigate("/restrictedAccess");
  };

  return (
    <div className="CreateInventory">
      {authState.role === "Admin" ? (
        <div className="createOuterDiv">
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            <Form className="loginForm">
              <div className="createFormContent">
                <h2 className="loginTitle">Create New Inventory</h2>

                <div className="field">
                  <label className="fieldLabel">Barcode Number: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <Field
                          name="barcodeNum"
                          placeholder="Barcode number"
                          className="createTextInput textInput"
                          required
                        />
                      </div>
                      <ErrorMessage
                        name="barcodeNum"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="fieldLabel">Item Name: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <Field
                          name="itemName"
                          placeholder="Item name"
                          className="createTextInput textInput"
                          required
                        />
                      </div>
                      <ErrorMessage
                        name="itemName"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="fieldLabel">Quantity: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <Field
                          name="quantity"
                          placeholder="Quantity"
                          className="createTextInput textInput"
                          required
                        />
                      </div>
                      <ErrorMessage
                        name="quantity"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="fieldLabel">Price: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <Field
                          name="price"
                          placeholder="Price"
                          className="createTextInput textInput"
                          required
                        />
                      </div>
                      <ErrorMessage
                        name="price"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="fieldLabel">Batch Number: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <Field
                          name="batchNum"
                          placeholder="Batch number"
                          className="createTextInput textInput"
                          required
                        />
                      </div>
                      <ErrorMessage
                        name="batchNum"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                {/* ADDED */}
                <div className="field">
                  <label className="fieldLabel">Expiry Date: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <div>
                          <DatePicker
                            selected={expiryDate}
                            onChange={(date) => setExpiryDate(date)}
                            placeholderText="DD/MM/YYYY"
                            className="createTextInput textInput"
                            // dateFormat="yyyy-MM-dd" // Specify date format
                            dateFormat="dd/MM/yyyy"
                            required={!noExpiryDate}
                            disabled={noExpiryDate}
                          />
                        </div>
                        <div className="noExpiryTextDiv">
                          <input
                            type="checkbox"
                            // id="expiryDateCheckbox"
                            name="expiryDateCheckbox"
                            checked={noExpiryDate}
                            onChange={(e) => setNoExpiryDate(e.target.checked)}
                          />
                          <label className="noExpDtLabel">No expiry date</label>
                        </div>
                      </div>
                      <ErrorMessage
                        name="expiryDate"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                {/* <div className="field">
                <label className="fieldLabel">Expiry Date: </label>
                <div>
                  <DatePicker
                    selected={expiryDate}
                    onChange={(date) => setExpiryDate(date)}
                    placeholderText="YYYY-MM-DD"
                    className="input"
                    dateFormat="yyyy-MM-dd" // Specify date format
                    required={!noExpiryDate}
                    disabled={noExpiryDate}
                  />
                </div>
              </div>
              <ErrorMessage
                name="expiryDate"
                component="span"
                className="err"
              /> */}

                <div className="field">
                  <label className="fieldLabel">Category: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <Field
                          as="select"
                          name="category"
                          className="createTextInput textInput categoryInput"
                          required
                        >
                          <option value="">Select a category</option>
                          {itemCategory.map((category, index) => (
                            <option key={index} value={category}>
                              {category}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <ErrorMessage
                        name="category"
                        component="span"
                        className="err"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="fieldLabel">Item Image: </label>
                  <div className="fieldInputCol">
                    <div className="fieldInput">
                      <div>
                        <input
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={(event) => setImage(event.target.files[0])}
                          className="imageInput"
                          required
                        />

                        {/* TEST styling */}
                        {/* <label for="file-upload" className="custom-file-upload">
                          Custom Upload
                        </label>
                        <input
                          id="file-upload"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={(event) => setImage(event.target.files[0])}
                          className="imageInput"
                          required
                        /> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="loginBtnDiv">
                  <button className="createBtn btn" type="submit">
                    Create
                  </button>
                </div>
              </div>
            </Form>
          </Formik>
        </div>
      ) : (
        // <>{invalidRoute()}</>
        <div className="RestrictedAccess">
          <div>
            <h2 className="pgNotFoundTitle">
              Access Denied: You don't have permission to view this page.
            </h2>
            <h3>
              Let's head back to the <Link to="/">home page</Link>
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInventory;
