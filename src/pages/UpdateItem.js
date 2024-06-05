import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { itemCategory } from "./Inventory";

function UpdateItem() {
  let { barcodeNum } = useParams();
  const [itemObject, setItemObject] = useState({});
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryDateUpdated, setExpiryDateUpdated] = useState(false);
  const [fieldUpdated, setFieldUpdated] = useState(false);

  useEffect(() => {
    // if (!authState.status)
    if (!localStorage.getItem("accessToken")) navigate("/login");
    else {
      axios
        .get(`https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory/byBarcodeNum/${barcodeNum}`)
        .then((response) => {
          setItemObject(response.data);
          setExpiryDate(response.data.expiryDate);
        });
    }
  }, []);

  const initialValues = {
    barcodeNum: itemObject.barcodeNum,
    itemName: itemObject.itemName,
    quantity: itemObject.quantity,
    price: itemObject.price, // 0.00
    batchNum: itemObject.batchNum,
    // expiryDate: itemObject.expiryDate ? itemObject.expiryDate : "",
    expiryDate: itemObject.expiryDate,
    category: itemObject.category,
    image: itemObject.image,
    userId: itemObject.userId,
    updatedBy: itemObject.updatedBy,
  };

  // TO ENHANCE
  const isFormValid = () => {
    return (
      fieldUpdated && Object.values(initialValues).some((val) => val !== "")
    );
  };

  const onSubmit = (data) => {
    if (itemObject.expiryDate !== null && expiryDateUpdated) {
      data.expiryDate = expiryDate; // assign updated value only if expiry date field is entered
    }

    data.updatedBy = authState.userId;

    axios
      .put(
        `https://qr-receipt-ddba1cd2d186.herokuapp.com/inventory/byBarcodeNum/${itemObject.barcodeNum}`,
        data,
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      )
      .then((response) => {
        alert(response.data);
        // window.location.reload(); // Reload and stay on the page
        navigate(`/item/${itemObject.barcodeNum}`);
      });

    setFieldUpdated(false);
  };

  const validationSchema = Yup.object().shape({
    barcodeNum: Yup.string(),
    itemName: Yup.string(),
    quantity: Yup.number().positive().integer(),
    price: Yup.number().positive(), // double
    batchNum: Yup.string(),
    // expiryDate: Yup.date(),
    category: Yup.string(),
  });

  return (
    <div>
      {/* <div className="itemDiv">
        <div className="itemCardContainer">
          <h2>Inventory Details</h2>

          <div className="itemCardInner">
            <div>
              <label>Barcode Number: </label>
              {itemObject.barcodeNum}
            </div>
            <div>
              <label>Item Name: </label>
              {itemObject.itemName}
            </div>
            <div>
              <label>Quantity: </label>
              {itemObject.quantity}
            </div>
            <div>
              <label>Price: RM </label>
              {parseFloat(itemObject.price).toFixed(2)}
            </div>
            <div>
              <label>Batch Number: </label>
              {itemObject.batchNum}
            </div>
            {itemObject.expiryDate !== null && (
              <div>
                <label>Expiry Date: </label>
                {itemObject.expiryDate}
              </div>
            )}
            <div>
              <label>Category: </label>
              {itemObject.category}
            </div>
          </div>
        </div>
      </div> */}

      {authState.role === "Admin" ? (
        <div>
          <div className="CreateInventory">
            <div className="createOuterDiv">
              <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
              >
                {({ handleChange }) => (
                  <Form className="loginForm">
                    <div className="createFormContent">
                      <h2 className="loginTitle">Update Details</h2>

                      <div className="field">
                        <label className="fieldLabel">Barcode Number: </label>
                        <div className="fieldInputCol">
                          <div className="fieldInputDisplay">
                            <div>{itemObject.barcodeNum}</div>
                          </div>
                        </div>
                        <ErrorMessage
                          name="barcodeNum"
                          component="span"
                          className="err"
                        />
                      </div>

                      <div className="field">
                        <label className="fieldLabel">Item Name: </label>
                        <div className="fieldInputCol">
                          <div className="fieldInput">
                            <div>
                              <Field
                                name="itemName"
                                placeholder={itemObject.itemName}
                                className="createTextInput textInput"
                                onChange={(e) => {
                                  handleChange(e);
                                  if (!fieldUpdated) setFieldUpdated(true);
                                }}
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
                                placeholder={itemObject.quantity}
                                className="createTextInput textInput"
                                onChange={(e) => {
                                  handleChange(e);
                                  if (!fieldUpdated) setFieldUpdated(true);
                                }}
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
                                placeholder={parseFloat(
                                  itemObject.price
                                ).toFixed(2)}
                                className="createTextInput textInput"
                                onChange={(e) => {
                                  handleChange(e);
                                  if (!fieldUpdated) setFieldUpdated(true);
                                }}
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
                                placeholder={itemObject.batchNum}
                                className="createTextInput textInput"
                                onChange={(e) => {
                                  handleChange(e);
                                  if (!fieldUpdated) setFieldUpdated(true);
                                }}
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

                      {itemObject.expiryDate !== null && (
                        <>
                          <div className="field">
                            <label className="fieldLabel">Expiry Date: </label>
                            <div className="fieldInputCol">
                              <div className="fieldInput">
                                <div>
                                  {/* <Field
                                  name="expiryDate"
                                  placeholder={itemObject.expiryDate}
                                  className="input"
                                /> */}
                                  <DatePicker
                                    selected={expiryDate}
                                    onChange={(date) => {
                                      setExpiryDate(date);
                                      setFieldUpdated(true);
                                      setExpiryDateUpdated(true);
                                    }}
                                    placeholderText={itemObject.expiryDate}
                                    className="createTextInput textInput"
                                    // dateFormat="yyyy-MM-dd"
                                    dateFormat="dd/MM/yyyy"
                                  />
                                </div>
                                <ErrorMessage
                                  name="expiryDate"
                                  component="span"
                                  className="err"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="field">
                        <label className="fieldLabel">Category: </label>
                        <div className="fieldInputCol">
                          <div className="fieldInput">
                            <div>
                              {/* <Field
                              as="select"
                              name="category"
                              className="createTextInput textInput categoryInput"
                              onChange={(e) => {
                                handleChange(e);
                                const selectedCategory = e.target.value;
                                if (selectedCategory !== "")
                                  setFieldUpdated(true);
                                else setFieldUpdated(false);
                              }}
                            >
                              <option value="">Select a category</option>
                              {itemCategory.map((category, index) => (
                                <option key={index} value={category}>
                                  {category}
                                </option>
                              ))}
                            </Field> */}

                              <Field
                                as="select"
                                name="category"
                                className="createTextInput textInput categoryInput"
                                value={itemObject.category}
                                onChange={(e) => {
                                  const selectedCategory = e.target.value;
                                  handleChange(e);
                                  setItemObject((prevItemObject) => ({
                                    ...prevItemObject,
                                    category: selectedCategory,
                                  }));
                                  setFieldUpdated(true);
                                }}
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

                      {/* <div>
                      <button
                        className="submitBtn"
                        type="submit"
                        disabled={!isFormValid()}
                      >
                        Confirm Update
                      </button>
                    </div> */}

                      <div className="updateBtnDiv">
                        <button
                          className={
                            !isFormValid()
                              ? `createBtn btn disabledBtn`
                              : "createBtn btn"
                          }
                          type="submit"
                          disabled={!isFormValid()}
                        >
                          Update
                        </button>

                        <div
                          onClick={() => {
                            navigate(`/item/${itemObject.barcodeNum}`);
                          }}
                        >
                          <button className="cancelBtn btn">Cancel</button>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      ) : (
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

export default UpdateItem;
