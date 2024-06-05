import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("accessToken");
    // window.location.reload(); // TO REFINE
    navigate("/login");
  };

  return (
    // <button className="logoutBtn btn" onClick={logout}>
    <button className="logoutDropdown" onClick={logout}>
      Logout
    </button>
  );
}

export default LogoutButton;
