// src/app.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

import MainContent from './components/MainContent';
import ProtectedRoute from './components/ProtectedRoute';

import AdminPanel from './pages/AdminPanel';

function App() {
  const [backendData, setBackendData] = useState({ users: [] });

  useEffect(() => {
    fetch("/users")
      .then((response) => response.json())
      .then((data) => setBackendData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/panel" element={<ProtectedRoute element={AdminPanel} />} />
            <Route path="*" element={<MainContent />} />
          </Routes>
        </BrowserRouter>
        {backendData.users.map((user, index) => (
          <React.Fragment key={index}>
            {user}
            {index !== backendData.users.length - 1 && <br />}
          </React.Fragment>
        ))}
      </LanguageProvider>
    </>
  );
}

export default App;
