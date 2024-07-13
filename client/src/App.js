import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import Reservation from './pages/Reservation';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar'; // Import Navbar component

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
        <Routes>
          <Route path="*" element={<NoPage />} />
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/panel" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>

      {backendData.users.map((user, index) => (
        <React.Fragment key={index}>
          {user}
          {index !== backendData.users.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default App;
//tggg