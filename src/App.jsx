// App.jsx
import React, { useState, useRef } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import Admin from "./components/Admin/AdminPanel";
import AdminSettings from "./components/AdminSettings/AdminSettings";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import "./App.css";


const App = () => {
  const [selectedPanel, setSelectedPanel] = useState("mesai");
  const [adminAccess, setAdminAccess] = useState(false);
  const nodeRef = useRef(null);

  const handleLogout = () => setAdminAccess(false);

  return (
    <>
      <Navbar
        selectedPanel={selectedPanel}
        setSelectedPanel={(panel) => {
          setSelectedPanel(panel);
          setAdminAccess(false); // Admin paneli değiştirince sıfırlansın
        }}
      />

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
      <Footer />
    </>
  );
};

export default App;
