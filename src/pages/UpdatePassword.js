import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

function UpdatePassword() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [viewOldPw, setViewOldPw] = useState(false);
  const [viewNewPw, setViewNewPw] = useState(false);
  const [viewConfirmNewPw, setViewConfirmNewPw] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/login");
  }, []);

  const updatePassword = () => {
    if (newPassword !== confirmNewPassword) {
      alert("New passwords must match");
    } else {
      if (newPassword.length < 8) {
        alert("New passwords must be at least 8 characters");
      } else {
        axios
          .put(
            "http://localhost:3001/auth/updatePassword",
            {
              oldPassword: oldPassword,
              newPassword: newPassword,
            },
            {
              headers: { accessToken: localStorage.getItem("accessToken") },
            }
          )
          .then((response) => {
            if (response.data.error) {
              alert(response.data.error);
            } else {
              alert("Password updated successfully");
              window.location.reload(); // refine
            }
          })
          .catch((error) => {
            console.error("Error updating password:", error);
            alert(
              "An error occurred while updating the password. Please try again."
            );
          });
      }
    }
  };

  return (
    <div className="UpdatePassword">
      <div className="createOuterDiv">
        <div className="loginForm">
          <div className="createFormContent">
            <h2 className="loginTitle">Update Password</h2>

            <div className="pwRow">
              <label className="pwLabel">Old Password: </label>
              <input
                type={viewOldPw ? "text" : "password"}
                placeholder="Old Password"
                onChange={(event) => {
                  setOldPassword(event.target.value);
                }}
                className="textInput pwInput"
                required
              />
              <div>
                {viewOldPw ? (
                  <VscEye
                    onClick={() => {
                      setViewOldPw(false);
                    }}
                    className="viewPwIcon"
                  />
                ) : (
                  <VscEyeClosed
                    onClick={() => {
                      setViewOldPw(true);
                    }}
                    className="viewPwIcon"
                  />
                )}
              </div>
            </div>

            <div className="pwRow">
              <label className="pwLabel">New Password: </label>
              <input
                type={viewNewPw ? "text" : "password"}
                placeholder="New Password"
                onChange={(event) => {
                  setNewPassword(event.target.value);
                }}
                className="textInput pwInput"
                required
              />
              <div>
                {viewNewPw ? (
                  <VscEye
                    onClick={() => {
                      setViewNewPw(false);
                    }}
                    className="viewPwIcon"
                  />
                ) : (
                  <VscEyeClosed
                    onClick={() => {
                      setViewNewPw(true);
                    }}
                    className="viewPwIcon"
                  />
                )}
              </div>
            </div>

            <div className="pwRow">
              <label className="pwLabel">Confirm New Password: </label>
              <input
                type={viewConfirmNewPw ? "text" : "password"}
                placeholder="Confirm New Password"
                onChange={(event) => {
                  setConfirmNewPassword(event.target.value);
                }}
                className="textInput pwInput"
                required
              />
              <div>
                {viewConfirmNewPw ? (
                  <VscEye
                    onClick={() => {
                      setViewConfirmNewPw(false);
                    }}
                    className="viewPwIcon"
                  />
                ) : (
                  <VscEyeClosed
                    onClick={() => {
                      setViewConfirmNewPw(true);
                    }}
                    className="viewPwIcon"
                  />
                )}
              </div>
            </div>

            <div className="loginBtnDiv updatePwBtnDiv">
              <button
                onClick={updatePassword}
                disabled={
                  oldPassword !== "" &&
                  newPassword !== "" &&
                  confirmNewPassword !== ""
                    ? false
                    : true
                }
                className={
                  oldPassword !== "" &&
                  newPassword !== "" &&
                  confirmNewPassword !== ""
                    ? "createBtn btn"
                    : "createBtn btn disabledBtn"
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;
