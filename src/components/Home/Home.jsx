import React, { useState, useEffect } from "react";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSyncAlt,
  faExclamationTriangle,
  faCheckCircle,
  faExclamationCircle,
  faSignOutAlt,
  faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const Home = () => {
  const [inputId, setInputId] = useState("");
  const [todayLogs, setTodayLogs] = useState([]);

  const groupTodayLogs = (logs) => {
    const grouped = {};

    logs.forEach((log) => {
      if (!grouped[log.fullName]) {
        grouped[log.fullName] = [];
      }
      grouped[log.fullName].push(log);
    });

    return Object.entries(grouped).map(([fullName, entries]) => {
      entries.sort((a, b) => a.time.localeCompare(b.time));

      let giriş = "-";
      let çıkış = "-";

      if (entries.length === 1) {
        const [saat, dakika] = entries[0].time.split(":").map(Number);
        const totalMin = saat * 60 + dakika;
        if (totalMin < 720) {
          giriş = entries[0].time;
        } else {
          çıkış = entries[0].time;
        }
      } else {
        giriş = entries[0].time;
        çıkış = entries[1].time;
      }

      return {
        fullName,
        giriş,
        çıkış,
      };
    });
  };
  const getEntryStyle = (entryTime) => {
    if (entryTime === "-") {
      return { backgroundColor: "#f0f0f0", color: "#6c757d" }; // gri boş
    }
    if (entryTime < "08:15:00") {
      return { backgroundColor: "#d4edda", color: "#155724" }; // yeşil
    } else if (entryTime < "08:30:00") {
      return { backgroundColor: "#fff3cd", color: "#856404" }; // sarı
    } else if (entryTime < "12:00:00") {
      return { backgroundColor: "#f8d7da", color: "#721c24" }; // kırmızı
    } else {
      return { backgroundColor: "#e2e3e5", color: "#383d41" }; // geç veya hatalı
    }
  };

  const getExitStyle = (exitTime) => {
    if (exitTime === "-") {
      return { backgroundColor: "#f0f0f0", color: "#6c757d" }; // gri boş
    }
    return { backgroundColor: "#d1ecf1", color: "#0c5460" }; // mavi
  };

  const getEvaluationData = (entryTime) => {
    if (entryTime === "-") {
      return {
        icon: null,
        label: "Kayıt Yok",
        style: { backgroundColor: "#f0f0f0", color: "#6c757d" },
      };
    }

    if (entryTime < "08:15:00") {
      return {
        icon: (
          <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#155724" }} />
        ),
        label: "Normal Giriş",
        style: { backgroundColor: "#d4edda", color: "#155724" }, // Açık yeşil zemin, koyu yeşil yazı
      };
    } else if (entryTime < "08:30:00") {
      return {
        icon: (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ color: "#856404" }}
          />
        ),
        label: "Geç Giriş",
        style: { backgroundColor: "#fff3cd", color: "#856404" }, // Açık sarı zemin, koyu sarı yazı
      };
    } else {
      return {
        icon: (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ color: "#721c24" }}
          />
        ),
        label: "Çok Geç Giriş",
        style: { backgroundColor: "#f8d7da", color: "#721c24" }, // Açık kırmızı zemin, koyu kırmızı yazı
      };
    }
  };

  const handleSubmit = async () => {
    if (!inputId) {
      alert("Lütfen ID giriniz.");
      return;
    }

    const employeeRef = doc(db, "employees", inputId);
    const employeeSnap = await getDoc(employeeRef);

    if (!employeeSnap.exists()) {
      alert("Girilen ID ile eşleşen personel bulunamadı.");
      return;
    }

    const logsQuery = query(
      collection(db, "workLogs"),
      where("employeeId", "==", inputId),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const logsSnapshot = await getDocs(logsQuery);

    const now = new Date();
    const employeeData = employeeSnap.data();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    await addDoc(collection(db, "workLogs"), {
      employeeId: inputId,
      fullName: employeeData.fullName,
      date,
      time,
      timestamp: Timestamp.now(),
    });

    setInputId("");
    fetchTodayLogs();
    alert("Mesai kaydı başarıyla eklendi.");
  };

  const fetchTodayLogs = async () => {
    const today = new Date().toISOString().split("T")[0];

    const q = query(
      collection(db, "workLogs"),
      where("date", "==", today),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map((doc) => doc.data());
    setTodayLogs(logs);
  };

  useEffect(() => {
    fetchTodayLogs();
  }, []);

  return (
    <div className="mesai-div">
      <div className="left-div">
        <div className="desc">
          <FontAwesomeIcon
            icon={faClock}
            size="lg"
            className="icon color-yellow"
          />
          <span className="ml-2">Mesai Takip Sistemi</span>
        </div>
        <div className="barcode-div">
          <input
            type="text"
            placeholder="Personel ID'nizi giriniz..."
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <div className="btn btn-yellow" onClick={handleSubmit}>
            Giriş / Çıkış Yap
          </div>
        </div>
      </div>

      <div className="log-div">
        <div className="log-header">
          <h3>Bugünün Kayıtları</h3>
          <button className="refresh-button" onClick={fetchTodayLogs}>
            <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: "6px" }} />
            Yenile
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ background: "#e0e0e0", fontWeight: "bold" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>İsim</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Giriş</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Çıkış</th>
              <th style={{ padding: "8px", textAlign: "left" }}>
                Değerlendirme
              </th>
            </tr>
          </thead>
          <tbody>
            {groupTodayLogs(todayLogs).map((log, index) => {
              const entryStyle = getEntryStyle(log.giriş);
              const exitStyle = getExitStyle(log.çıkış);
              const evaluation = getEvaluationData(log.giriş);

              return (
                <tr key={index}>
                  <td
                    style={{
                      padding: "8px",
                      backgroundColor: "#f7f7f7",
                      fontWeight: "500",
                    }}
                  >
                    {log.fullName}
                  </td>
                  <td
                    style={{ padding: "8px", fontWeight: "600", ...entryStyle }}
                  >
                    {log.giriş}
                  </td>
                  <td
                    style={{ padding: "8px", fontWeight: "600", ...exitStyle }}
                  >
                    {log.çıkış}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "600",
                      ...evaluation.style,
                    }}
                  >
                    {evaluation.icon}{" "}
                    <span style={{ marginLeft: "6px" }}>
                      {evaluation.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
