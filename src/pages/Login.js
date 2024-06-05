import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useContext(AuthContext);
  const { authState } = useContext(AuthContext);

  let navigate = useNavigate();

  const login = () => {
    const data = { userId: userId, password: password };
    axios
      .post("https://qr-receipt-ddba1cd2d186.herokuapp.com/auth/login", data)
      .then((response) => {
        if (response.data.error) alert(response.data.error);
        else {
          localStorage.setItem("accessToken", response.data.token);
          setAuthState({
            // username: response.data.username,
            userId: response.data.userId,
            role: response.data.role,
            status: true,
          });
          navigate("/"); // direct to home
          // navigate("/inventoryList"); // direct to inventory list
        }
      });
  };

  return (
    <div className="fullDiv">
      <div className="outerDiv">
        {!authState.status ? (
          <div className="loginForm">
            <div className="loginFormContent">
              <div className="appLogoDiv">
                <img
                  src="./logo-sub-trans.png"
                  alt="logo"
                  className="appLogo"
                />
              </div>
              <h2 className="loginTitle">Login</h2>

              <div>
                {/* <label className="fieldLabel">User ID: </label> */}
                <div>
                  <input
                    className="loginTextInput textInput"
                    type="text"
                    placeholder="User ID"
                    onChange={(event) => {
                      setUserId(event.target.value);
                    }}
                  />
                </div>

                {/* <label className="fieldLabel">Password: </label> */}
                <div className="loginBottomInput">
                  <input
                    className="loginTextInput textInput"
                    type="password"
                    placeholder="Password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                  />
                </div>
              </div>

              {/* <div className="loginBtnDiv"> */}
              <div className="loginBtnDiv" style={{ paddingBottom: 15 }}>
                <button className="loginBtn btn" onClick={login}>
                  <label>Login</label>
                </button>
              </div>

              <div className="signUpTextDiv">
                <label className="signUpText">Don't have an account? </label>
                <Link className="signUpText linkText" to="/registration">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="loginFormContent">
            <h3>- User is logged in -</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
