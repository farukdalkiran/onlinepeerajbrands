import React, { useState, useEffect } from "react";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSyncAlt,
  faExclamationTriangle,
  faCheckCircle,
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
import { toast } from "react-toastify";

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
    if (entryTime === "-")
      return { backgroundColor: "#f0f0f0", color: "#6c757d" };
    if (entryTime < "08:15:00")
      return { backgroundColor: "#d4edda", color: "#155724" };
    if (entryTime < "08:30:00")
      return { backgroundColor: "#fff3cd", color: "#856404" };
    if (entryTime < "12:00:00")
      return { backgroundColor: "#f8d7da", color: "#721c24" };
    return { backgroundColor: "#e2e3e5", color: "#383d41" };
  };

  const getExitStyle = (exitTime) => {
    if (exitTime === "-")
      return { backgroundColor: "#f0f0f0", color: "#6c757d" };
    return { backgroundColor: "#d1ecf1", color: "#0c5460" };
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
        style: { backgroundColor: "#d4edda", color: "#155724" },
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
        style: { backgroundColor: "#fff3cd", color: "#856404" },
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
        style: { backgroundColor: "#f8d7da", color: "#721c24" },
      };
    }
  };

  const handleSubmit = async () => {
    const trimmedId = inputId.trim();

    if (!trimmedId) {
      toast.error("Lütfen ID giriniz.");
      return;
    }

    const employeeRef = doc(db, "employees", trimmedId);
    const employeeSnap = await getDoc(employeeRef);

    if (!employeeSnap.exists()) {
      toast.error("Girilen ID ile eşleşen personel bulunamadı.");
      return;
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const logQuery = query(
      collection(db, "workLogs"),
      where("employeeId", "==", trimmedId),
      where("timestamp", ">", Timestamp.fromDate(oneHourAgo))
    );

    const recentLogsSnap = await getDocs(logQuery);

    if (!recentLogsSnap.empty) {
      toast.warn("Bu kullanıcı son 1 saat içinde zaten giriş yaptı.");
      return;
    }

    const employeeData = employeeSnap.data();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    await addDoc(collection(db, "workLogs"), {
      employeeId: trimmedId,
      fullName: employeeData.fullName,
      date,
      time,
      timestamp: Timestamp.now(),
    });

    setInputId("");
    fetchTodayLogs();
    toast.success("Mesai kaydı başarıyla eklendi!");
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
  const refreshSuccessful = () => {
    toast.info("Tablo Yenilendi", {
      className: "custom-toast",
    });
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
          <span className="ml-2">Mesai Takip</span>
        </div>
        <div className="barcode-div">
          <input
            type="text"
            placeholder="Personel ID'nizi giriniz..."
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <div className="btn btn-yellow" onClick={handleSubmit}style={{width:"100%"}}>
            Giriş / Çıkış Yap
          </div>
        </div>
      </div>

      <div className="log-div">
        <div className="log-header">
          <h3>Bugünün Kayıtları</h3>
          <button
            className="refresh-button"
            onClick={() => {
              fetchTodayLogs();
              refreshSuccessful();
            }}
          >
            <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: "6px" }} />
            Yenile
          </button>
        </div>

        <div
          style={{
            maxHeight: "350px", // Yüksekliği sınırla
            overflowY: "auto", // Y ekseninde scroll’a izin ver
            overflowX: "hidden", // X taşmasını önle
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
              tableLayout: "fixed", // X taşmasını önlemeye yardımcı olur
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
                      style={{
                        padding: "8px",
                        fontWeight: "600",
                        ...entryStyle,
                      }}
                    >
                      {log.giriş}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "600",
                        ...exitStyle,
                      }}
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
                      {evaluation.icon}
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
    </div>
  );
};

export default Home;
