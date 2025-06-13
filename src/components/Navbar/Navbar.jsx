import React from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUnlockKeyhole,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ setSelectedPanel, selectedPanel, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <div id="logo">
          <img id="lego-logo" src="/Img/legologo.png" alt="LEGO Logo" />
          <p className="brand">Peeraj Brands</p>
        </div>
        <div className="nav">
          <a
            href="#"
            className={`nav-item ${selectedPanel === "mesai" ? "active" : ""}`}
            onClick={() => setSelectedPanel("mesai")}
          >
            Mesai Takip
          </a>
          <a
            href="#"
            className={`nav-item ${
              selectedPanel === "new-employee" ? "active" : ""
            }`}
            onClick={() => setSelectedPanel("new-employee")}
          >
            Çalışan Yönetimi
          </a>
          <a
            href="#"
            className={`nav-item ${selectedPanel === "admin" ? "active" : ""}`}
            onClick={() => setSelectedPanel("admin")}
          >
            <FontAwesomeIcon icon={faUnlockKeyhole} />
            <span>Yönetici Paneli</span>
          </a>
          <div className="logout-btn" onClick={onLogout} title="Çıkış Yap">
            <FontAwesomeIcon icon={faRightFromBracket} className="fa-exit" />
            Çıkış
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
