import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [language, setLanguage] = useState('EN');
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'EN' ? 'PL' : 'EN'));
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Psychologist</div>
      <div className="navbar-center-container">
        <ul className="navbar-menu">
          <li><Link to="/home" className={location.pathname === '/home' || location.pathname === '/' ? 'current' : ''}>Home</Link></li>
          <li><Link to="/reservation" className={location.pathname === '/reservation' ? 'current' : ''}>Reservation</Link></li>
          <li><Link to="/services" className={location.pathname === '/services' ? 'current' : ''}>Services</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'current' : ''}>Contact</Link></li>
        </ul>
      </div>
      <button className="language-toggle" onClick={toggleLanguage}>
        {language}
      </button>
    </nav>
  );
}

export default Navbar;
