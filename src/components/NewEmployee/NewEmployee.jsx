import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./NewEmployee.css";

import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

const ADMIN_PW = "5702017";

/**
 * Firestore yapısı (sade):
 * employees (koleksiyon)
 *   └─ 2020 (documentId)  → { fullName: "Faruk Dalkıran", createdAt: ... }
 */

const NewEmployee = () => {
  const [adminPass, setAdminPass] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [empId, setEmpId] = useState("");
  const [fullName, setFullName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedForDelete, setSelectedForDelete] = useState("");

  /* Çalışanları Firestore'dan çek */
  const loadEmployees = async () => {
    const snap = await getDocs(collection(db, "employees"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    setEmployees(list);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* Admin şifre onayı */
  const handleConfirm = () => {
    if (!adminPass.trim()) return toast.warn("Şifre boş olamaz!");
    if (adminPass === ADMIN_PW) {
      toast.success("Doğrulama başarılı");
      setIsApproved(true);
    } else {
      toast.error("Şifre yanlış!");
      setIsApproved(false);
    }
  };

  /* Çalışan ekle */
  const handleAdd = async () => {
    if (!isApproved) return toast.info("Önce admin şifresi doğrulayın");
    if (!/^[0-9]{4}$/.test(empId)) return toast.warn("ID 4 haneli sayı olmalı");
    if (!fullName.trim()) return toast.warn("Ad Soyad gerekli");

    const docRef = doc(db, "employees", empId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return toast.error(`${empId} ID'si zaten kayıtlı.`);
    }

    try {
      await setDoc(docRef, {
        fullName,
        createdAt: new Date(),
      });
      toast.success("Çalışan eklendi");
      setEmpId("");
      setFullName("");
      loadEmployees();
    } catch (err) {
      toast.error("Veri eklenirken hata oluştu");
      console.error(err);
    }
  };

  /* Çalışan sil */
  const handleDelete = async () => {
    if (!isApproved) return toast.info("Önce admin şifresi doğrulayın");
    if (!selectedForDelete) return toast.warn("Silinecek çalışan seçin");
    if (!window.confirm("Seçili çalışan silinecek, emin misiniz?")) return;

    try {
      await deleteDoc(doc(db, "employees", selectedForDelete));
      toast.success("Çalışan silindi");
      setSelectedForDelete("");
      loadEmployees();
    } catch (err) {
      toast.error("Silme hatası");
      console.error(err);
    }
  };

  return (
    <div className="new-employee-container">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* SOL PANEL */}
      <div className="left-panel">
        {/* Yönetici şifre onayı */}
        <div className="card admin-confirm-panel">
          <h4>Yönetici Doğrulama</h4>
          <label>Admin Şifresi</label>
          <input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
          />
          <button className="btn btn-blue" onClick={handleConfirm}>
            Onayla
          </button>
        </div>

        {/* Çalışan ekleme formu */}
        <div className="card add-panel">
          <h4>Çalışan Ekle</h4>
          <label>ID (4 haneli)</label>
          <input
            type="text"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            disabled={!isApproved}
          />
          <label>Ad Soyad</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isApproved}
          />
          <button
            className="btn btn-green"
            onClick={handleAdd}
            disabled={!isApproved}
          >
            Ekle
          </button>
        </div>

        {/* Çalışan silme */}
        <div className="card delete-panel">
          <h4>Çalışan Sil</h4>
          <select
            value={selectedForDelete}
            onChange={(e) => setSelectedForDelete(e.target.value)}
            disabled={!isApproved}
          >
            <option value="">-- Çalışan Seç --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
          <button
            className="btn btn-red"
            onClick={handleDelete}
            disabled={!isApproved}
          >
            Sil
          </button>
        </div>
      </div>

      <div className="new-employee-right-panel">
        <h3>Çalışan Listesi</h3>
        <div className="new-employee-table-wrapper">
          <table className="new-employee-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad Soyad</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.fullName}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="2">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewEmployee;
