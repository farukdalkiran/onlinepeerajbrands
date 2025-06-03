import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-text copyright">
        © {new Date().getFullYear()} Peeraj Brands | LEGO Certified Store
      </p>
      <p className="footer-text author">
        Bu site <strong>Faruk Dalkıran</strong> tarafından geliştirilmiştir.
      </p>
    </footer>
  );
};

export default Footer;
