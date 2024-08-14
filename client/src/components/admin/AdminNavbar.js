// src/components/AdminNavbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

const AdminNavbar = ({ adminName, onLogout, refreshAccessToken }) => {
  const location = useLocation();
  const links = [
    { to: '/panel/reservations', label: 'Reservations' },
    { to: '/panel/clients', label: 'Clients' },
    { to: '/panel/psychologists', label: 'Psychologists' },
    { to: '/panel/rooms', label: 'Rooms' }
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleLinkClick = () => {
    refreshAccessToken();
  };

  return (
    <nav className="admin-navbar">
      <div className="welcome-message">
        Welcome {adminName}
      </div>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link 
              to={link.to} 
              className={location.pathname === link.to ? 'current' : ''}
              onClick={handleLinkClick}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="logout-button" onClick={handleLogout}>
        Logout
      </div>
    </nav>
  );
};

export default AdminNavbar;
