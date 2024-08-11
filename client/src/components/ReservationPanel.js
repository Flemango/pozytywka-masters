import React, { useContext, useState, useEffect, useRef } from 'react';
import { loadCaptchaEnginge, LoadCanvasTemplate, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';

import { LanguageContext } from '../context/LanguageContext';
import ReservationCalendar, { openingHours } from './ReservationCalendar';
import { format, isSameDay, parseISO } from 'date-fns';

import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';
import './SubmitForms.css';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const calendarRef = useRef(null);

  const psychologists = [
    { id: 1, name: 'Dr. Emily Brown' },
    { id: 2, name: 'Dr. Michael Johnson' },
    // Add more psychologists as needed
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('userAccessToken');
      const rememberToken = localStorage.getItem('userAccessToken');
      if (!token && !rememberToken) {
        sessionStorage.removeItem('user');
        return;
      } else {
        if (rememberToken) {
          const savedUserData = JSON.parse(localStorage.getItem('user'));
          if (savedUserData) {
            setFirstName(savedUserData.firstName);
            setLastName(savedUserData.lastName);
            setEmail(savedUserData.email);
            setIsLoggedIn(true);
          }
        }
        else {
          const userData = JSON.parse(sessionStorage.getItem('user'));
          if (userData) {
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            setEmail(userData.email);
            setIsLoggedIn(true);
          }
        }
      }
    };

    checkAuth();
  }, []);
  

  const handleTimeSelect = (date, time) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setSelectedTime(time);
    setDate(formattedDate); // Update form input
    setTime(time); // Update form input
  };

  useEffect(() => {
    loadCaptchaEnginge(6,'white','#333'); 
    setDate(selectedDate);
    setTime(selectedTime);

    if (psychologists.length > 0 && !selectedPsychologist) {
      setSelectedPsychologist(psychologists[0].id);
    }
  }, [selectedDate, selectedTime]);

  const translations = {
    EN: {
      title: 'Reserve an Appointment',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      psychologist: 'Select Psychologist',
      date: 'Date',
      time: 'Time',
      captcha: 'Captcha',
      enter_captcha: 'Enter Captcha',
      reserve: 'Reserve',
      confirmation: 'Reservation confirmed for',
      invalidDateTime: 'The selected date or time is not available. Please choose from the calendar.',
    },
    PL: {
      title: 'Zarezerwuj spotkanie',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      email: 'Email',
      psychologist: 'Wybierz psychologa',
      date: 'Data',
      time: 'Godzina',
      captcha: 'Captcha',
      enter_captcha: 'Wpisz Captcha',
      reserve: 'Rezerwuj',
      confirmation: 'Rezerwacja potwierdzona dla',
      invalidDateTime: 'Wybrana data lub godzina jest niedostępna. Proszę wybrać z kalendarza.',
    }
  };

  const isDateTimeAvailable = (date, time) => {
    if (!selectedPsychologist) return false;
    const dayOfWeek = format(parseISO(date), 'EEEE');
    const availableTimes = openingHours[selectedPsychologist]?.[dayOfWeek] || [];
    return availableTimes.includes(time);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCaptcha(captcha)) {
      if (isDateTimeAvailable(date, time)) {
        setMessage(`${translations[language].confirmation} ${firstName} ${lastName} on ${date} at ${time}`);
      } else {
        setMessage(translations[language].invalidDateTime);
      }
    } else {
      setMessage('Captcha Does Not Match');
    }
  };

  const handleFocus = () => {
    if (calendarRef.current) {
      calendarRef.current.classList.add('animate-calendar');
      setTimeout(() => {
        calendarRef.current.classList.remove('animate-calendar');
      }, 600); // Duration of the animation
    }
  };

  const preventTyping = (e) => {
    e.preventDefault();
    handleFocus();
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
                  placeholder="Jan"
                  onChange={(e) => setFirstName(e.target.value)}
                  readOnly={isLoggedIn}
                  required
                />
              </label>
              <label>
                {translations[language].lastName}:
                <input
                  type="text"
                  value={lastName}
                  placeholder="Kowalski"
                  onChange={(e) => setLastName(e.target.value)}
                  readOnly={isLoggedIn}
                  required
                />
              </label>
            </div>
            <div className="name-container">
            <label>
              {translations[language].email}:
              <input
                type="email"
                value={email}
                placeholder="user@example.com"
                onChange={(e) => setEmail(e.target.value)}
                readOnly={isLoggedIn}
                required
              />
            </label>
            <label>
              {translations[language].psychologist}:
              <select
                value={selectedPsychologist}
                onChange={(e) => setSelectedPsychologist(parseInt(e.target.value))}
                required
              >
                <option value="" disabled>Select a psychologist</option>
                {psychologists.map(psychologist => (
                  <option key={psychologist.id} value={psychologist.id}>
                    {psychologist.name}
                  </option>
                ))}
              </select>
            </label>
            </div>
            <div className="date-time-container">
              <label>
                {translations[language].date}:
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  //readOnly
                  onKeyDown={preventTyping}
                  onFocus={handleFocus}
                  required
                />
              </label>
              <label>
                {translations[language].time}:
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  //readOnly
                  onKeyDown={preventTyping}
                  onFocus={handleFocus}
                  required
                />
              </label>
            </div>
            {/* <label>{translations[language].captcha}:</label> */}
            <div className="captcha-container">
              <label>
                {translations[language].enter_captcha}:
                <input
                  type="text"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  required
                />
              </label>
              <label className="captcha">
              {translations[language].captcha}:
              <LoadCanvasTemplateNoReload />
              </label>
            </div>
            <button type="submit">{translations[language].reserve}</button>
          </form>
          {message && <p className="confirmation-message">{message}</p>}
        </div>
      </div>
      <div className="calendar-column" ref={calendarRef}>
      <ReservationCalendar 
        onTimeSelect={handleTimeSelect} 
        selectedPsychologist={selectedPsychologist}
      />
      </div>
    </div>
  );
}

export default ReservationPanel;
