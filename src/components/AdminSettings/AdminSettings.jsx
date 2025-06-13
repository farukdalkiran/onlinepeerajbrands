import React, { useEffect, useState } from "react";
import "../Home/Home.css";
import "./AdminSettings.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUnlockKeyhole,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminSettings = ({ adminLogout }) => {
  // Çalışan listesi
  const [employees, setEmployees] = useState([]);
  // Seçilen çalışan id'si
  const [selectedEmployee, setSelectedEmployee] = useState("");
  // Çalışanın seçilen aya ait çalışma kayıtları
  const [workLogs, setWorkLogs] = useState([]);
  // Seçilen ay (YYYY-MM formatında)
  const [selectedMonth, setSelectedMonth] = useState("");

  // 1️⃣ Çalışanları çek
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const snapshot = await getDocs(collection(db, "employees"));
        const empList = snapshot.docs.map((doc) => ({
          id: doc.id,
          fullName: doc.data().fullName,
        }));
        setEmployees(empList);
      } catch (error) {
        console.error("Çalışanlar çekilemedi:", error);
      }
    };
    fetchEmployees();
  }, []);

  // 2️⃣ Filtreleme: Seçili çalışan ve ay bazında çalışma kayıtlarını getir
  const handleFilter = async () => {
    if (!selectedEmployee) return alert("Lütfen bir çalışan seçin.");
    if (!selectedMonth) return alert("Lütfen bir ay seçin.");

    try {
      // employeeId'ye göre filtrele
      const q = query(
        collection(db, "workLogs"),
        where("employeeId", "==", selectedEmployee)
      );
      const snapshot = await getDocs(q);
      let logs = snapshot.docs.map((doc) => doc.data());

      // Seçili aya göre filtrele
      logs = logs.filter((log) => log.date.startsWith(selectedMonth));
      logs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

      // Aynı gün içindeki kayıtları grupla
      const groupedByDate = {};
      logs.forEach((log) => {
        if (!groupedByDate[log.date]) groupedByDate[log.date] = [];
        groupedByDate[log.date].push(log);
      });

      // Günlük ilk giriş ve son çıkış, ek mesai ve değerlendirme hesapla
      const finalLogs = Object.entries(groupedByDate).map(([date, daily]) => {
        daily.sort((a, b) => (a.time < b.time ? -1 : 1));
        let giriş = "-";
        let çıkış = "-";

        if (daily.length === 1) {
          const [saat, dakika] = daily[0].time.split(":").map(Number);
          const totalMin = saat * 60 + dakika;
          if (totalMin < 720) giriş = daily[0].time;
          else çıkış = daily[0].time;
        } else if (daily.length >= 2) {
          giriş = daily[0].time;
          çıkış = daily[daily.length - 1].time;
        }

        // Ek mesai hesaplama
        let ekMesai = "---";
        if (çıkış !== "-") {
          const [cSaat, cDak] = çıkış.split(":").map(Number);
          const total = cSaat * 60 + cDak;
          const mesailer = [
            { dakika: 1260, label: "4 saat" },
            { dakika: 1215, label: "3.5 saat" },
            { dakika: 1180, label: "3 saat" },
            { dakika: 1155, label: "2.5 saat" },
            { dakika: 1120, label: "2 saat" },
            { dakika: 1095, label: "1.5 saat" },
            { dakika: 1050, label: "1 saat" },
          ];
          for (const m of mesailer) {
            if (total >= m.dakika) {
              ekMesai = m.label;
              break;
            }
          }
        }

        // Geç giriş değerlendirmesi
        let değerlendirme = "";
        if (giriş !== "-") {
          const [gSaat, gDak] = giriş.split(":").map(Number);
          const total = gSaat * 60 + gDak;
          if (total <= 494) değerlendirme = "Normal";
          else if (total <= 509) değerlendirme = "Geç Giriş";
          else değerlendirme = "Kritik Geç Giriş";
        }

        return { date, giriş, çıkış, ekMesai, değerlendirme };
      });

      setWorkLogs(finalLogs);
    } catch (err) {
      console.error("Kayıtlar çekilemedi:", err);
    }
  };

  // 3️⃣ Excel'e Aktar - Seçili aya ait tüm çalışanların kayıtları
  const exportExcel = async () => {
    if (!selectedMonth) return alert("Lütfen bir ay seçin.");

    try {
      const allLogsSnapshot = await getDocs(collection(db, "workLogs"));
      let allLogs = allLogsSnapshot.docs.map((d) => d.data());

      allLogs = allLogs.filter((l) => l.date.startsWith(selectedMonth));
      allLogs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

      if (allLogs.length === 0) {
        alert("Seçili ayda kayıt bulunamadı!");
        return;
      }

      // İsim bazında grupla
      const grouped = {};
      allLogs.forEach((log) => {
        const emp = employees.find((e) => e.id === log.employeeId);
        const name = emp ? emp.fullName : "Bilinmeyen";
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(log);
      });

      // Excel Workbook oluştur
      const wb = XLSX.utils.book_new();

      Object.entries(grouped).forEach(([fullName, records]) => {
        const byDate = {};
        records.forEach((r) => {
          if (!byDate[r.date]) byDate[r.date] = [];
          byDate[r.date].push(r);
        });

        const data = [["Tarih", "Giriş", "Çıkış", "Ek Mesai", "Değerlendirme"]];
        const sortedDates = Object.keys(byDate).sort();

        sortedDates.forEach((date) => {
          const recs = byDate[date];
          recs.sort((a, b) => (a.time < b.time ? -1 : 1));
          let giriş = "-";
          let çıkış = "-";

          if (recs.length === 1) {
            const [s, d] = recs[0].time.split(":").map(Number);
            (s * 60 + d) < 720 ? (giriş = recs[0].time) : (çıkış = recs[0].time);
          } else if (recs.length >= 2) {
            giriş = recs[0].time;
            çıkış = recs[recs.length - 1].time;
          }

          let ekMesai = "-";
          if (çıkış !== "-") {
            const [cs, cd] = çıkış.split(":").map(Number);
            const tm = cs * 60 + cd;
            if (tm >= 1260) ekMesai = "4 saat";
            else if (tm >= 1215) ekMesai = "3.5 saat";
            else if (tm >= 1180) ekMesai = "3 saat";
            else if (tm >= 1155) ekMesai = "2.5 saat";
            else if (tm >= 1120) ekMesai = "2 saat";
            else if (tm >= 1095) ekMesai = "1.5 saat";
            else if (tm >= 1050) ekMesai = "1 saat";
          }

          let değerlendirme = "";
          if (giriş !== "-") {
            const [gs, gd] = giriş.split(":").map(Number);
            const tt = gs * 60 + gd;
            değerlendirme = tt <= 494 ? "Normal" : tt <= 509 ? "Geç Giriş" : "Kritik Geç Giriş";
          }

          data.push([date, giriş, çıkış, ekMesai, değerlendirme]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        const sheetName = fullName.length > 31 ? fullName.slice(0, 31) : fullName;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      const fileName = `Aylik_Mesai_Raporu_${selectedMonth}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
    } catch (error) {
      console.error("Excel aktarılırken hata oluştu:", error);
    }
  };

  return (
    <div className="admin-panel-div">
      <div className="admin-main-div">
        {/* HEADER */}
        <div className="admin-top">
          <div className="header">
            <FontAwesomeIcon icon={faUnlockKeyhole} /> <span>Yönetici Paneli</span>
          </div>
        </div>

        {/* FİLTRE ALANI */}
        <div className="admin-filter">
          <label htmlFor="employee-select">Çalışan Seç :</label>
          <select
            id="employee-select"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">-- Seçiniz --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>

          <label htmlFor="month-select">Ay Seç :</label>
          <input
            type="month"
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ marginLeft: 8, marginRight: 16 }}
          />

          <div className="btn btn-yellow" onClick={handleFilter}>
            Filtrele
          </div>
        </div>

        {/* TABLO */}
        <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Giriş Saati</th>
                <th>Çıkış Saati</th>
                <th>Ek Mesai</th>
                <th>Değerlendirme</th>
              </tr>
            </thead>
            <tbody>
              {workLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                workLogs.map((row, i) => (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.giriş}</td>
                    <td>{row.çıkış}</td>
                    <td>{row.ekMesai}</td>
                    <td>{row.değerlendirme}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BUTONLAR */}
        <div className="buttons">
          <div className="btn btn-red" onClick={adminLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Çıkış Yap
          </div>
          <div className="excel-export-btn btn-green btn" onClick={exportExcel}>
            <FontAwesomeIcon icon={faDownload} className="fa-download"/>Aylık Excel Raporunu İndir
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
