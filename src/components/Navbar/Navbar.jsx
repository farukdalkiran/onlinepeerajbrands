import React from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ setSelectedPanel, selectedPanel }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <div id="logo">
          <img id="lego-logo" src="/Img/legologo.png" alt="LEGO Logo" />
          <p className="brand">Peeraj Brands</p>
        </div>
        <div className="nav">
          <a
            className={`nav-item ${selectedPanel === "mesai" ? "active" : ""}`}
            onClick={() => setSelectedPanel("mesai")}
          >
            Mesai Takip
          </a>
          <a
            className={`nav-item ${selectedPanel === "admin" ? "active" : ""}`}
            onClick={() => setSelectedPanel("admin")}
          >
            <FontAwesomeIcon icon={faUnlockKeyhole} />
            <span>Yönetici Paneli</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
