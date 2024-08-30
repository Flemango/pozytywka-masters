// src/app.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

import MainContent from './components/MainContent';
import ProtectedRoute from './components/ProtectedRoute';

import AdminPanel from './pages/admin/AdminPanel';

function App() {

  return (
    <>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/panel/*" element={<ProtectedRoute element={AdminPanel} />} />
            <Route path="*" element={<MainContent />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </>
  );
}

export default App;
