import React, { useContext, useState, useEffect } from 'react';
import './SubmitForms.css';
import { LanguageContext } from '../context/LanguageContext';
import ReservationCalendar from './ReservationCalendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';

function ReservationPanel() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [message, setMessage] = useState('');
  const { language } = useContext(LanguageContext);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleTimeSelect = (date, time) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setSelectedTime(time);
    setDate(formattedDate); // Update form input
    setTime(time); // Update form input
  };

  useEffect(() => {
    setDate(selectedDate);
    setTime(selectedTime);
  }, [selectedDate, selectedTime]);

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
  };

  return (
    <div className="reservation-page">
      <div className="reservation-column">
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
      </div>
      <div className="calendar-column">
        <ReservationCalendar onTimeSelect={handleTimeSelect} />
      </div>
    </div>
  );
}

export default ReservationPanel;
