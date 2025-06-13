import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import Admin from "./components/Admin/AdminPanel";
import AdminSettings from "./components/AdminSettings/AdminSettings";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Entry from "./components/Entry/Entry";
import NewEmployee from "./components/NewEmployee/NewEmployee";

const App = () => {
  const [selectedPanel, setSelectedPanel] = useState("mesai");
  const [adminAccess, setAdminAccess] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const nodeRef = useRef(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("authenticated");
    if (isLoggedIn === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleFullLogout = () => {
    setAuthenticated(false);
    setAdminAccess(false);
    localStorage.removeItem("authenticated");
  };

  // Yönetici panelinden çıkış yapıldığında çağrılır
  const handleAdminLogout = () => {
    setAdminAccess(false);
  };

  if (!authenticated) {
    return (
      <>
        <Entry onSuccess={() => setAuthenticated(true)} />
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        selectedPanel={selectedPanel}
        setSelectedPanel={(panel) => {
          setSelectedPanel(panel);
          setAdminAccess(false); // Admin paneline geçişte önce erişim kapatılır
        }}
        onLogout={handleFullLogout}
      />

      <div className="content">
        <SwitchTransition>
          <CSSTransition
            key={selectedPanel + (adminAccess ? "-access" : "")}
            nodeRef={nodeRef}
            timeout={300}
            classNames="fade"
            unmountOnExit
          >
            <div ref={nodeRef}>
              {selectedPanel === "mesai" && <Home />}
              {selectedPanel === "new-employee" && <NewEmployee />}
              {selectedPanel === "admin" &&
                (adminAccess ? (
                  <AdminSettings adminLogout={handleAdminLogout} />
                ) : (
                  <Admin onAccessGranted={() => setAdminAccess(true)} />
                ))}
            </div>
          </CSSTransition>
        </SwitchTransition>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      <Footer />
    </div>
  );
};

export default App;
