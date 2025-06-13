// AdminPanel.jsx
import React, { useState } from "react";
import "../Home/Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons";

const AdminPanel = ({ onAccessGranted }) => {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "5702017") {
      onAccessGranted(); // App'e bildir
    } else {
      alert("Hatalı şifre!");
    }
  };

  return (
    <div className="panel-div">
      <div className="main-div">
        <div className="desc">
          <FontAwesomeIcon icon={faUnlockKeyhole} className="icon color-red" />
          <span className="ml-2">Yönetici Paneli</span>
        </div>
        <div className="barcode-div">
          <input
            type="password"
            placeholder="Yönetici şifresini giriniz..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
          <div className="btn btn-red" onClick={handleLogin} style={{width: "100%"}}>
            Giriş Yap
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
