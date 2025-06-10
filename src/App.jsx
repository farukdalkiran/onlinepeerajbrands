import React, { useState, useRef } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import Admin from "./components/Admin/AdminPanel";
import AdminSettings from "./components/AdminSettings/AdminSettings";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { ToastContainer } from "react-toastify";
import "./App.css";

const App = () => {
  const [selectedPanel, setSelectedPanel] = useState("mesai");
  const [adminAccess, setAdminAccess] = useState(false);
  const nodeRef = useRef(null);

  const handleLogout = () => setAdminAccess(false);

  return (
    <div className="app-container">
      <Navbar
        selectedPanel={selectedPanel}
        setSelectedPanel={(panel) => {
          setSelectedPanel(panel);
          setAdminAccess(false);
        }}
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
              {selectedPanel === "admin" &&
                (adminAccess ? (
                  <AdminSettings onLogout={handleLogout} />
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
