// frontend/src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          {/* Note: The copyright year is hardcoded to 2025 as per the image */}
          <span className="copyright">© 2025 dribbble</span>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
        <div className="footer-right">
          <Link to="/jobs">Jobs</Link>
          <Link to="/designers">Designers</Link>
          <Link to="/freelancers">Freelancers</Link>
          <Link to="/tags">Tags</Link>
          <Link to="/places">Places</Link>
          <Link to="/resources">Resources</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;