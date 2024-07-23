import React from 'react';
import { Routes, Route} from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

import Home from '../pages/Home';
import NoPage from '../pages/NoPage';
import Reservation from '../pages/Reservation';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import AdminLogin from '../pages/AdminLogin';
import Login from '../pages/Login';
import Register from '../pages/Register';

const MainContent = () => {

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

          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default MainContent;
