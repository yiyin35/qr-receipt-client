import React, { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Registration() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  const [role, setRole] = useState("");
  const [listOfUser, setListOfUser] = useState([]);

  const initialValues = {
    userId: "",
    // username: "",
    password: "",
    confirmPassword: "",
    role: "",
  };

  const onSubmit = (data) => {
    // data.role = role;

    // axios.post("http://localhost:3001/auth", data).then(() => {
    //   console.log(data); // check
    //   navigate("/login");
    // });

    axios
      .get("https://qr-receipt-ddba1cd2d186.herokuapp.com/auth")
      .then((response) => {
        setListOfUser(response.data);
        checkExistingUser(response.data);
      })
      .catch((error) => {
        console.error("Error checking userId:", error);
      });

    const checkExistingUser = (users) => {
      const existingUser = users.find((user) => user.userId === data.userId);

      if (existingUser) {
        alert("User ID already exists. Please choose a different one.");
      } else {
        data.role = role;
        axios
          .post("https://qr-receipt-ddba1cd2d186.herokuapp.com/auth", data)
          .then(() => {
            console.log(data); // check
            alert("Your account has been created. Please log in to continue.");
            navigate("/login");
          });
      }
    };
  };

  const validationSchema = Yup.object().shape({
    userId: Yup.string().min(6).max(20), // remove .required(), required added below
    // username: Yup.string().max(50), // remove .required(), required added below
    password: Yup.string().min(8).max(20), // remove .required(), required added below
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password"), null],
      "Passwords must match"
    ),
    role: Yup.string(), // remove .required(), required added below
  });

  return (
    <div className="fullDiv">
      <div className="outerDiv">
        {!authState.status ? (
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({ errors, touched }) => (
              <Form className="loginForm" autoComplete="off">
                <div className="loginFormContent">
                  <div className="appLogoDiv">
                    <img
                      src="./logo-sub-trans.png"
                      alt="logo"
                      className="appLogo"
                    />
                  </div>
                  <h2 className="loginTitle">Create Account</h2>

                  {/* <label className="fieldLabel">User ID: </label> */}
                  <div>
                    <Field
                      name="userId"
                      placeholder="User ID"
                      className="loginTextInput textInput"
                      required
                    />
                  </div>
                  <ErrorMessage
                    name="userId"
                    component="span"
                    className="err"
                  />

                  {/* <label className="fieldLabel">Username: </label> */}
                  {/* <div className="loginBottomInput">
                  <Field
                    name="username"
                    placeholder="Username"
                    className="loginTextInput textInput"
                    required
                  />
                </div>
                <ErrorMessage
                  name="username"
                  component="span"
                  className="err"
                /> */}

                  {/* <label className="fieldLabel">Password: </label> */}
                  <div className="loginBottomInput">
                    <Field
                      name="password"
                      placeholder="Password"
                      type="password"
                      className="loginTextInput textInput"
                      required
                    />
                  </div>
                  <ErrorMessage
                    name="password"
                    component="span"
                    className="err"
                  />

                  <div className="loginBottomInput">
                    <Field
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      type="password"
                      className="loginTextInput textInput"
                      required
                    />
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <span className="err">{errors.confirmPassword}</span>
                  )}

                  <div className="loginBottomInput">
                    <label>Creating account for: </label>
                    <label>
                      <input
                        type="radio"
                        name="role"
                        value="Admin"
                        className="loginRadioButton"
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                      Admin
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="role"
                        value="Cashier"
                        className="loginRadioButton"
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                      Cashier
                    </label>
                  </div>
                  <ErrorMessage name="role" component="span" className="err" />

                  <div className="loginBtnDiv">
                    <button className="registerBtn btn" type="submit">
                      Create Account
                    </button>
                  </div>

                  <div className="signUpTextDiv">
                    <label className="signUpText">
                      Already have an account?{" "}
                    </label>
                    <Link className="signUpText linkText" to="/login">
                      Login
                    </Link>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="loginFormContent">
            <h3>- User is logged in -</h3>
            <h4>Please logout to register.</h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default Registration;
