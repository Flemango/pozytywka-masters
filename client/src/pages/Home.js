// src/pages/Home.js
import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const translations = {
    EN: {
      welcome: 'Welcome to Our Psychology Practice',
      description: 'Your mental well-being is our priority. We offer personalized therapy to help you navigate life\'s challenges.',
      button: 'Learn More'
    },
    PL: {
      welcome: 'Witamy w Naszej Praktyce Psychologicznej',
      description: 'Twoje zdrowie psychiczne jest naszym priorytetem. Oferujemy spersonalizowaną terapię, aby pomóc Ci w radzeniu sobie z wyzwaniami życiowymi.',
      button: 'Dowiedz Się Więcej'
    }
  };

  return (
    <div>
      <h1>{translations[language].welcome}</h1>
      <p>{translations[language].description}</p>
      <button className="home-button" onClick={() => {navigate('/services');}}>{translations[language].button}</button>
    </div>
  );
}
