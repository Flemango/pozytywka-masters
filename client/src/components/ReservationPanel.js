import React, { useContext, useState } from 'react';
import './ReservationPanel.css';
import { LanguageContext } from '../context/LanguageContext';

function ReservationPanel() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [message, setMessage] = useState('');
  const { language } = useContext(LanguageContext);

  const translations = {
    EN: {
      title: 'Reserve an Appointment',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      date: 'Date',
      time: 'Time',
      captcha: 'Captcha',
      reserve: 'Reserve',
      confirmation: 'Reservation confirmed for'
    },
    PL: {
      title: 'Zarezerwuj spotkanie',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      email: 'Email',
      date: 'Data',
      time: 'Godzina',
      captcha: 'Captcha',
      reserve: 'Rezerwuj',
      confirmation: 'Rezerwacja potwierdzona dla'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(`${translations[language].confirmation} ${firstName} ${lastName} on ${date} at ${time}`);
    // Here you could add code to send the reservation details to your server
  };

  return (
    <div className="reservation-container">
      <h2>{translations[language].title}</h2>
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="name-container">
          <label>
            {translations[language].firstName}:
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label>
            {translations[language].lastName}:
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          {translations[language].email}:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <div className="date-time-container">
        <label>
          {translations[language].date}:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          {translations[language].time}:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>
        </div>
        <label>
          {translations[language].captcha}:
          <input
            type="text"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            required
          />
        </label>
        <button type="submit">{translations[language].reserve}</button>
      </form>
      {message && <p className="confirmation-message">{message}</p>}
    </div>
  );
}

export default ReservationPanel;
