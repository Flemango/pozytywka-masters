import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, } from 'react-router-dom';
import Axios from 'axios';

import Navbar from './Navbar';
import Footer from './Footer';

import Home from '../pages/Home';
import NoPage from '../pages/NoPage';
import Reservation from '../pages/Reservation';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import AdminLogin from '../pages/admin/AdminLogin';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';

const MainContent = () => {
  const navigate = useNavigate();
  const accessToken = sessionStorage.getItem('userAccessToken');

  // useEffect(() => {
  //   let interval;
    
  //   const refreshAccessToken = async () => {
  //     try {
  //       const response = await Axios.post(
  //         'http://localhost:5000/refresh',
  //         {},
  //         { headers: { Authorization: `Bearer ${accessToken}` } }
  //       );

  //       sessionStorage.setItem('userAccessToken', response.data.accessToken);
  //     } catch (error) {
  //       sessionStorage.removeItem('userAccessToken');
  //       sessionStorage.removeItem('user');
  //     }
  //   };

  //   if (accessToken) {
  //     interval = setInterval(refreshAccessToken, 15000); // Refresh every 15 seconds
  //   }

  //   return () => clearInterval(interval);
  // }, [accessToken, navigate]);

  return (
    <>
      <Navbar />
      <div className="content" id="content">
        <Routes>
          <Route path="*" element={<NoPage />} />
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default MainContent;
