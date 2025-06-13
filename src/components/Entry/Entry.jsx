import "./Entry.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const Entry = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      toast.warn("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.success("Giriş başarılı!");
        onSuccess();
      } else {
        toast.error("Kullanıcı adı veya şifre hatalı!");
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="entry-container">
      <div className="entry-main-div">
        <div className="top-header">
          <h4>
            <FontAwesomeIcon icon={faWarehouse} className="fa-icon" />
            Mesai 
            Yönetim Sistemi
          </h4>
          <img src="/Img/palet.jpg" alt="" className="entry-img" />
        </div>

        <div className="desc-header">
          <h5>Giriş</h5>
          <h6>Hoşgeldiniz</h6>
        </div>

        <div className="form">
          <label>Kullanıcı Adı</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <div className="entry-btn" onClick={handleLogin}>
            Giriş
          </div>
        </div>

        <div className="info">
          <p>
            Giriş bilgilerine sahip değilseniz, yöneticiniz ile irtibata geçiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Entry;
