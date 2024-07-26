// src/components/Navbar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem('userAccessToken'));
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem('userAccessToken');
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const translations = {
    EN: { home: 'Home', reservation: 'Reservation', services: 'Services', contact: 'Contact', login: isLoggedIn ? 'Log out' : 'Log in' },
    PL: { home: 'Strona Główna', reservation: 'Rezerwacja', services: 'Usługi', contact: 'Kontakt', login: isLoggedIn ? 'Wyloguj' : 'Zaloguj' }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Pozytywka</div>
      <div className="navbar-center-container">
        <ul className="navbar-menu">
          <li><Link to="/home" className={location.pathname === '/home' || location.pathname === '/' ? 'current' : ''}>{translations[language].home}</Link></li>
          <li><Link to="/reservation" className={location.pathname === '/reservation' ? 'current' : ''}>{translations[language].reservation}</Link></li>
          <li><Link to="/services" className={location.pathname === '/services' ? 'current' : ''}>{translations[language].services}</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'current' : ''}>{translations[language].contact}</Link></li>
        </ul>
      </div>
      {isLoggedIn ? (
        <button className="logout-button" onClick={handleLogout}>{translations[language].login}</button>
      ) : (
        <Link to="/login" className={`login-button ${location.pathname === '/login' ? 'current' : ''}`}>{translations[language].login}</Link>
      )}
      <button className="language-toggle" onClick={toggleLanguage}>
        {language}
      </button>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`navbar-menu-container ${menuOpen ? 'open' : ''}`}>
        <ul className="navbar-menu-mobile">
          <li><Link to="/home" className={location.pathname === '/home' || location.pathname === '/' ? 'current' : ''}>{translations[language].home}</Link></li>
          <li><Link to="/reservation" className={location.pathname === '/reservation' ? 'current' : ''}>{translations[language].reservation}</Link></li>
          <li><Link to="/services" className={location.pathname === '/services' ? 'current' : ''}>{translations[language].services}</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'current' : ''}>{translations[language].contact}</Link></li>
          <li>{isLoggedIn ? (
            <button className="logout-button" onClick={handleLogout}>{translations[language].login}</button>
          ) : (
            <Link to="/login" className={`login-button ${location.pathname === '/login' ? 'current' : ''}`}>{translations[language].login}</Link>
          )}</li>
        </ul>
        <button className="language-toggle-mobile" onClick={toggleLanguage}>
          {language}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
