import React from "react";
import { useNavigate } from "react-router-dom";

function UpdatePasswordButton() {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/updatePassword");
  };

  return (
    <button className="logoutDropdown" onClick={goToProfile}>
      Update Password
    </button>
  );
}

export default UpdatePasswordButton;
