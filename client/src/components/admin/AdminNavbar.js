// src/components/AdminNavbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavbar = () => {
  const location = useLocation();
  const links = [
    { to: '/panel/reservations', label: 'Reservations' },
    { to: '/panel/clients', label: 'Clients' },
    { to: '/panel/psychologists', label: 'Psychologists' },
    { to: '/panel/rooms', label: 'Rooms' }
  ];

  return (
    <nav className="admin-navbar">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link 
              to={link.to} 
              className={location.pathname === link.to ? 'current' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminNavbar;
