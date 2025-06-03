import React, { useEffect, useState } from "react";
import "../Home/Home.css";
import "./AdminSettings.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faSignOutAlt,
  faUnlockKeyhole,
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const AdminSettings = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [workLogs, setWorkLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // "2025-06" gibi

  // Çalışanları çek
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

  // Filtrele butonuna basınca logları çek
  const handleFilter = async () => {
    if (!selectedEmployee) return alert("Lütfen bir çalışan seçin.");
    if (!selectedMonth) return alert("Lütfen bir ay seçin.");
    try {
      const q = query(
        collection(db, "workLogs"),
        where("employeeId", "==", selectedEmployee)
      );
      const snapshot = await getDocs(q);
      let logs = snapshot.docs.map((doc) => doc.data());
      logs = logs.filter((log) => {
        const [year, month] = selectedMonth.split("-");
        return log.date.startsWith(`${year}-${month}`);
      });
      // Tarihe göre sıralama
      logs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

      // Günlük giriş-çıkış ve çalışma süresi hesaplama
      const groupedByDate = {};

      logs.forEach((log) => {
        if (!groupedByDate[log.date]) {
          groupedByDate[log.date] = [];
        }
        groupedByDate[log.date].push(log);
      });

      const finalLogs = Object.entries(groupedByDate).map(([date, logs]) => {
        logs.sort((a, b) => (a.time < b.time ? -1 : 1));

        let giriş = "-";
        let çıkış = "-";

        if (logs.length === 1) {
          const [saat, dakika] = logs[0].time.split(":").map(Number);
          const totalMin = saat * 60 + dakika;
          if (totalMin < 720) {
            giriş = logs[0].time;
          } else {
            çıkış = logs[0].time;
          }
        } else if (logs.length >= 2) {
          giriş = logs[0].time;
          çıkış = logs[logs.length - 1].time;
        }

        // Ek mesai hesaplama (aynı)
        let ekMesai = "---";
        if (çıkış !== "-") {
          const [çSaat, çDakika] = çıkış.split(":").map(Number);
          const toplamDakika = çSaat * 60 + çDakika;

          const mesaiSaatleri = [
            { dakika: 1260, label: "4 saat" },
            { dakika: 1215, label: "3.5 saat" },
            { dakika: 1180, label: "3 saat" },
            { dakika: 1155, label: "2.5 saat" },
            { dakika: 1120, label: "2 saat" },
            { dakika: 1095, label: "1.5 saat" },
            { dakika: 1050, label: "1 saat" },
          ];

          for (const mesai of mesaiSaatleri) {
            if (toplamDakika >= mesai.dakika) {
              ekMesai = mesai.label;
              break;
            }
          }
        }

        // Geç giriş durumu
        let geçGirişDurumu = "";
        if (giriş !== "-") {
          const [gSaat, gDakika] = giriş.split(":").map(Number);
          const dakikaToplam = gSaat * 60 + gDakika;

          if (dakikaToplam <= 494) {
            // 08:14 veya öncesi
            geçGirişDurumu = "normal";
          } else if (dakikaToplam <= 509) {
            // 08:15 - 08:29
            geçGirişDurumu = "gecikme";
          } else {
            // 08:30 ve sonrası
            geçGirişDurumu = "kritik";
          }
        }

        return {
          date,
          giriş,
          çıkış,
          geçGirişDurumu,
          ekMesai,
        };
      });

      setWorkLogs(finalLogs);
    } catch (error) {
      console.error("Kayıtlar çekilemedi:", error);
    }
  };

  return (
    <div className="admin-panel-div">
    <div className="admin-main-div">
      <div className="admin-top">
        <div className="header">
          <FontAwesomeIcon icon={faUnlockKeyhole} />
          <span>Yönetici Paneli</span>
        </div>
      </div>

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
          style={{ marginLeft: "8px", marginRight: "16px" }}
        />

        <div className="btn btn-yellow" onClick={handleFilter}>
          Filtrele
        </div>
      </div>

      <div className="employee-table">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Giriş Saati</th>
              <th>Çıkış Saati</th>
              <th>Ek Mesai</th>
              <th>Geç Giriş</th>
            </tr>
          </thead>

          <tbody>
            {workLogs.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
            {workLogs.map((log, i) => (
              <tr key={i}>
                <td>{log.date}</td>
                <td>{log.giriş}</td>
                <td>{log.çıkış}</td>
                <td>{log.ekMesai}</td>
                <td>
                  {log.geçGirişDurumu === "normal" && (
                    <span
                      style={{
                        backgroundColor: "#22c55e",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Normal Giriş
                    </span>
                  )}
                  {log.geçGirişDurumu === "gecikme" && (
                    <span
                      style={{
                        backgroundColor: "#facc15",
                        color: "#92400e",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      Geç Giriş
                    </span>
                  )}
                  {log.geçGirişDurumu === "kritik" && (
                    <span
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                      Kritik Geç Giriş
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="btn btn-red" onClick={onLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Çıkış Yap
      </div>
    </div>
    </div>
  );
};
export default AdminSettings;
