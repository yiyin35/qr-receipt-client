import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  NavLink,
} from "react-router-dom";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import CreateInventory from "./pages/CreateInventory";
import Item from "./pages/Item";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PageNotFound from "./pages/PageNotFound";
import Checkout from "./pages/Checkout";
import UpdateItem from "./pages/UpdateItem";
import TransactionHistory from "./pages/TransactionHistory";
import Transaction from "./pages/Transaction";
import CreateAccount from "./pages/CreateAccount";
import LogoutButton from "./components/LogoutButton";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import UserIcon from "./components/UserIcon";
import UpdatePassword from "./pages/UpdatePassword";

function App() {
  // let navigate = useNavigate();
  const [authState, setAuthState] = useState({
    userId: "",
    role: "",
    status: false,
  });
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/auth", {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((response) => {
        if (response.data.error) setAuthState({ ...authState, status: false });
        else {
          setAuthState({
            userId: response.data.userId,
            role: response.data.role,
            status: true,
          });
        }
      });

    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ userId: "", role: "", status: false });
    // navigate("/login");
  };

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          {authState.status && (
            <div className="navBar">
              <div>
                {/* <NavLink className="navTab" to="/">
                  Home
                </NavLink> */}
                <NavLink className="navTab" to="/">
                  {/* <NavLink className="navTab" to="/inventoryList"> */}
                  Inventories
                </NavLink>
                {authState.role === "Admin" && (
                  <NavLink className="navTab" to="/addNewItem">
                    Add Inventory
                  </NavLink>
                )}
                <NavLink className="navTab" to="/checkout">
                  Checkout
                </NavLink>
                <NavLink className="navTab" to="/transactionHistory">
                  Transactions
                </NavLink>
                {authState.role === "Admin" && (
                  <NavLink className="navTab" to="/createAccount">
                    Create Account
                  </NavLink>
                )}
              </div>

              {/* USER ICON */}
              <div className="userIconComp">
                <UserIcon />
              </div>
            </div>
          )}

          <Routes>
            {/* <Route path="/" exact element={<Home />}></Route> */}
            <Route path="/" exact element={<Inventory />}></Route>
            {/* <Route path="/inventoryList" exact element={<Inventory />}></Route> */}
            <Route
              path="/addNewItem"
              exact
              element={<CreateInventory />}
            ></Route>
            <Route path="/item/:barcodeNum" exact element={<Item />}></Route>
            <Route path="/login" exact element={<Login />}></Route>
            <Route
              path="/registration"
              exact
              element={<Registration />}
            ></Route>
            <Route path="/checkout" exact element={<Checkout />}></Route>
            {/* new */}
            <Route
              path="/updateItem/:barcodeNum"
              exact
              element={<UpdateItem />}
            ></Route>
            <Route
              path="/transactionHistory"
              exact
              element={<TransactionHistory />}
            ></Route>
            <Route
              path="/transaction/:trxId"
              exact
              element={<Transaction />}
            ></Route>
            <Route
              path="/createAccount"
              exact
              element={<CreateAccount />}
            ></Route>
            <Route path="/profile" exact element={<Profile />}></Route>
            <Route
              path="/updatePassword"
              exact
              element={<UpdatePassword />}
            ></Route>
            {/* <Route path="/item/:barcodeNum" exact element={<Item />}></Route> */}
            <Route path="*" exact element={<PageNotFound />}></Route>
          </Routes>

          {/* <Footer /> */}
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
