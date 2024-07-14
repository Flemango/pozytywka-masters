import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [language, setLanguage] = useState('EN');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'EN' ? 'PL' : 'EN'));
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Pozytywka</div>
      <div className="navbar-center-container">
        <ul className="navbar-menu">
          <li><Link to="/home" className={location.pathname === '/home' || location.pathname === '/' ? 'current' : ''}>Home</Link></li>
          <li><Link to="/reservation" className={location.pathname === '/reservation' ? 'current' : ''}>Reservation</Link></li>
          <li><Link to="/services" className={location.pathname === '/services' ? 'current' : ''}>Services</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'current' : ''}>Contact</Link></li>
        </ul>
        <button className="language-toggle" onClick={toggleLanguage}>
          {language}
        </button>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`navbar-menu-container ${menuOpen ? 'open' : ''}`}>
        <ul className="navbar-menu-mobile">
          <li><Link to="/home" className={location.pathname === '/home' || location.pathname === '/' ? 'current' : ''}>Home</Link></li>
          <li><Link to="/reservation" className={location.pathname === '/reservation' ? 'current' : ''}>Reservation</Link></li>
          <li><Link to="/services" className={location.pathname === '/services' ? 'current' : ''}>Services</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'current' : ''}>Contact</Link></li>
        </ul>
        <button className="language-toggle-mobile" onClick={toggleLanguage}>
          {language}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
