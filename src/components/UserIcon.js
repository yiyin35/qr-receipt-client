import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RiUserStarLine, RiUserLine } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa";
import UpdatePasswordButton from "./UpdatePasswordButton";
import LogoutButton from "./LogoutButton";

function UserIcon() {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState({
    userId: "",
    role: "",
    status: false,
  });
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    axios
      .get("https://qr-receipt-ddba1cd2d186.herokuapp.com/auth/auth", {
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
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        !event.target.closest(".dropdownIconDiv")
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToProfile = () => {
    navigate("/profile");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ userId: "", role: "", status: false });
    window.location.reload(); // TO REFINE
  };

  return (
    <div>
      <div className="userSection">
        <div
          className="roleIconDiv"
          onClick={() => {
            setOpenProfile(!openProfile);
          }}
        >
          {authState.role === "Admin" ? (
            <RiUserStarLine className="roleIcon" />
          ) : (
            <RiUserLine className="roleIcon" />
          )}
        </div>

        {/* <div
          className="dropdownIconDiv"
          onClick={() => {
            setOpenProfile(!openProfile);
          }}
        >
          <FaAngleDown className="dropdownIcon" />
        </div> */}

        {openProfile && (
          <div className="profileDropdownDiv" ref={profileRef}>
            <div className="profileDropdown">
              <div className="dropdownDisabledDiv">
                <label className="dropdownSubtitle">Currently in</label>
                <div
                  className="dropdownCurrentInDiv"
                  // onClick={() => {
                  //   setOpenProfile(false);
                  //   goToProfile();
                  // }}
                >
                  <div className="currentInUserIcon">
                    <div
                      className="roleIconDiv1"
                      onClick={() => {
                        setOpenProfile(!openProfile);
                      }}
                    >
                      {authState.role === "Admin" ? (
                        <RiUserStarLine className="roleIcon" />
                      ) : (
                        <RiUserLine className="roleIcon" />
                      )}
                    </div>
                  </div>
                  <div className="currentInUserInfo">
                    <div className="dropdownDisabled disabledTop">
                      {authState.userId}
                    </div>
                    <div className="dropdownDisabled disabledBottom">
                      {authState.role}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dropdownEnabledDiv">
                <label className="dropdownSubtitle">More options</label>
                <div className="dropdownMoreOptDiv">
                  <div className="dropdownEnabled">
                    <div
                      className="enabledText"
                      onClick={() => {
                        setOpenProfile(false);
                      }}
                    >
                      <UpdatePasswordButton />
                    </div>
                  </div>
                  <div className="dropdownEnabled enabledBottom">
                    <div
                      className="enabledText"
                      onClick={() => {
                        setOpenProfile(false);
                        logout();
                      }}
                    >
                      Logout
                      {/* <LogoutButton /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserIcon;
