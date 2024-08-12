// src/components/AdminNavbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import './AdminNavbar.css';

const AdminNavbar = ({ adminName, onLogout }) => {
  const location = useLocation();
  const links = [
    { to: '/panel/reservations', label: 'Reservations' },
    { to: '/panel/clients', label: 'Clients' },
    { to: '/panel/psychologists', label: 'Psychologists' },
    { to: '/panel/rooms', label: 'Rooms' }
  ];

  const navigate = useNavigate();

  const refreshAccessToken = async () => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      const response = await Axios.post(
        'http://localhost:5000/refresh',
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      sessionStorage.setItem('sccessToken', response.data.accessToken);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      sessionStorage.removeItem('accessToken');
      navigate('/'); // Redirect to login page or any other page as needed
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
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
              //onClick={refreshAccessToken}
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
