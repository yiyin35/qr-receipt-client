import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";

function Profile() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/login");
  }, []);

  return (
    <div className="Profile">
      <div className="profileOuterDiv">
        <div className="searchDiv">
          <h2 className="pwPageTitle">Profile</h2>
        </div>

        <div className="profileInfoDiv">
          <div className="profileRow">
            <label className="profileLabel">User ID:</label>
            <div className="profileData">{authState.userId}</div>
          </div>

          <div className="profileRow">
            <label className="profileLabel">Role:</label>
            <div className="profileData">{authState.role}</div>
          </div>
        </div>

        <div className="linkToUpdatePwDiv">
          <Link to="/updatePassword" className="linkToUpdatePw btn">
            Update Password
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
