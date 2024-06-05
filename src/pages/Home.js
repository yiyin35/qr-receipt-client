import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";

function Home() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  const [homeHeight, setHomeHeight] = useState("calc(100vh - 68px)");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/login");

    const handleResize = () => {
      setHomeHeight(
        `calc(100vh - ${document.querySelector(".navBar").offsetHeight}px)`
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="Home"
      style={{
        backgroundImage: "url('inventory-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        // height: "100vh",
        height: homeHeight,
      }}
    >
      <div className="welcomeDiv">
        <div className="searchInputOuter">
          <h2 className="welcomeText">Welcome!</h2>
        </div>
      </div>

      <div className="linkDiv">
        <Link to="/inventoryList" className="homeLink">
          <div className="linkBtn">View All Inventories</div>
        </Link>
        <Link to="/addNewItem" className="homeLink">
          <div className="linkBtn">Add New Inventory</div>
        </Link>
        <Link to="/checkout" className="homeLink">
          <div className="linkBtn">Checkout</div>
        </Link>
        <Link to="/transactionHistory" className="homeLink">
          <div className="linkBtn">View Transaction History</div>
        </Link>
      </div>
    </div>
  );
}

export default Home;
