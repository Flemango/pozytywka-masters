// src/context/LanguageContext.js
import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('EN');

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'EN' ? 'PL' : 'EN'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
