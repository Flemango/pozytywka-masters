import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import Reservation from './pages/Reservation';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import './App.css';

function App() {
  const [backendData, setBackendData] = useState({ users: [] });

  useEffect(() => {
    fetch("/users")
      .then((response) => response.json())
      .then((data) => setBackendData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Navbar /> {/* Add Navbar component */}
        <div className="content" id="content">
          <Routes>
            <Route path="*" element={<NoPage />} />
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/panel" element={<AdminPanel />} />
          </Routes>
        </div>
      </BrowserRouter>
      {backendData.users.map((user, index) => (
        <React.Fragment key={index}>
          {user}
          {index !== backendData.users.length - 1 && <br />}
        </React.Fragment>
      ))}
      <Footer />
    </div>
  );
}

export default App;
