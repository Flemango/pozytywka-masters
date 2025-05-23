import React, { useContext, useState, useEffect, useRef } from 'react';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import ReservationCalendar from './ReservationCalendar';
import { format, parseISO } from 'date-fns';
import Axios from 'axios';

import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';
import './SubmitForms.css';

function ReservationPanel() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [message, setMessage] = useState('');
  const { language } = useContext(LanguageContext);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [psychologists, setPsychologists] = useState([]);
  const [workingHours, setWorkingHours] = useState({});
  const [duration, setDuration] = useState(1); // Default to 1 hour
  const [isWaitingForSuggestion, setIsWaitingForSuggestion] = useState(false);
  const [hasSuggestion, setHasSuggestion] = useState(false);
  const navigate = useNavigate();
  const calendarRef = useRef(null);

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
      suggestReservation: 'Suggest Reservation',
      pleaseWait: 'Please Wait...',
      suggestionError: 'Error getting suggestion. Please try again.',
      suggestionMessage: 'Suggested appointment: ',
      reservationFailed: 'Reservation failed. Please try again.',
      invalidRequest: 'Invalid reservation request. Please check your input and try again.',
      conflictingReservation: 'This time slot is no longer available. Please choose a different time.',
      serverError: 'A server error occurred. Please try again later.',
      unknownError: 'An unknown error occurred. Please try again.',
      networkError: 'Unable to connect to the server. Please check your internet connection and try again.',
      captchaError: 'Captcha verification failed. Please try again.',
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
      suggestReservation: 'Zaproponuj Rezerwację',
      pleaseWait: 'Proszę czekać...',
      suggestionError: 'Błąd podczas pobierania sugestii. Spróbuj ponownie.',
      suggestionMessage: 'Propozycja rezerwacji: ',
      reservationFailed: 'Rezerwacja nie powiodła się. Proszę spróbować ponownie.',
      invalidRequest: 'Nieprawidłowe żądanie rezerwacji. Sprawdź wprowadzone dane i spróbuj ponownie.',
      conflictingReservation: 'Ten termin nie jest już dostępny. Proszę wybrać inny czas.',
      serverError: 'Wystąpił błąd serwera. Proszę spróbować później.',
      unknownError: 'Wystąpił nieznany błąd. Proszę spróbować ponownie.',
      networkError: 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie.',
      captchaError: 'Weryfikacja Captcha nie powiodła się. Proszę spróbować ponownie.',
    }
  };

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const response = await Axios.get('http://localhost:5000/reservation-panel');
        setPsychologists(response.data);
        const hours = response.data.reduce((acc, psy) => {
          acc[psy.id] = psy.workingHours;
          return acc;
        }, {});
        setWorkingHours(hours);

        if (response.data.length > 0) {
          setSelectedPsychologist(response.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      }
    };

    fetchPsychologists();

    const checkAuth = async () => {
      const token = sessionStorage.getItem('userAccessToken');
      const rememberToken = localStorage.getItem('userAccessToken');
      if (!token && !rememberToken) {
        sessionStorage.removeItem('user');
        return;
      } else {
        // Fetch user data from the backend based on the JWT token
        Axios.get('http://localhost:5000/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
            const user = response.data.user; // Assuming user profile is returned in 'user' object
            setUserId(user.id);
            setFirstName(user.email);
            setLastName(user.lastName);
            setEmail(user.email);
            setIsLoggedIn(true);
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);

            if (error.response && error.response.status === 403) {
              sessionStorage.removeItem('userAccessToken');
              localStorage.removeItem('userAccessToken');
              navigate('/login');
            }
          });
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    loadCaptchaEnginge(6,'white','#333'); 
    setDate(selectedDate);
    setTime(selectedTime);

    if (psychologists.length > 0 && !selectedPsychologist) {
      setSelectedPsychologist(psychologists[0].id);
    }
  }, [selectedDate, selectedTime]);
  
  const isDateTimeAvailable = (date, time) => {
    if (!selectedPsychologist) return false;
    const dayOfWeek = format(parseISO(date), 'EEEE');
    const dayHours = workingHours[selectedPsychologist]?.[dayOfWeek] || [];
    return dayHours.some(hour => {
      const startTime = hour.start;
      const endTime = hour.end;
      return time >= startTime && time < endTime;
    });
  };

  const handleTimeSelect = (date, selectedTime, selectedDuration) => {
    // Ensure we're working with the correct date in the local timezone
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const formattedDate = format(localDate, 'yyyy-MM-dd');
    
    setSelectedDate(formattedDate);
    setSelectedTime(selectedTime);
    setDate(formattedDate);
    setTime(selectedTime);
    setDuration(selectedDuration);
  };

  const handleSuggestReservation = async () => {
    if (!userId || !selectedPsychologist) {
      return;
    }

    setIsWaitingForSuggestion(true);
    const token = localStorage.getItem('userAccessToken') || sessionStorage.getItem('userAccessToken');

    try {
      const response = await Axios.post('http://localhost:5000/suggest-reservation', 
        { userId: userId, psychologistId: selectedPsychologist },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.suggestedDate) {
        const suggestedDate = new Date(response.data.suggestedDate);
        setSelectedDate(format(suggestedDate, 'yyyy-MM-dd'));
        setDate(format(suggestedDate, 'yyyy-MM-dd'));
        setSelectedTime(response.data.suggestedTime);
        setTime(response.data.suggestedTime);
        setDuration(response.data.suggestedDuration.replace('h', ''));
        setMessage(`${translations[language].suggestionMessage}${format(suggestedDate, 'yyyy-MM-dd')} ${response.data.suggestedTime} ${response.data.suggestedDuration}`);
        setHasSuggestion(true);
        
        // Scroll to the calendar
        if (calendarRef.current) {
          calendarRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setMessage('No suggestion available. Please choose a date manually.');
      }
    } catch (error) {
      console.error('Error getting reservation suggestion:', error);
      setMessage(translations[language].suggestionError);
    } finally {
      setIsWaitingForSuggestion(false);
    }
  };

  const getDisplayTime = () => {
    if (!time) return '';
    return `${time} - ${duration}h`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateCaptcha(captcha)) {
      if (isDateTimeAvailable(date, time)) {
        try {
          const response = await Axios.post('http://localhost:5000/create-reservation', 
            {
              firstName,
              lastName,
              email,
              psychologistId: selectedPsychologist,
              date,
              time,
              duration
            }
          );
  
          if (response.status === 201) {
            navigate('/confirmation', { 
              state: { 
                reservationDetails: {
                  firstName,
                  lastName,
                  email,
                  date,
                  time,
                  duration
                } 
              } 
            });
          } else {
            setMessage(translations[language].reservationFailed);
          }
        } catch (error) {
          console.error('Error creating reservation:', error);
          if (error.response) {
            switch (error.response.status) {
              case 400:
                setMessage(translations[language].invalidRequest);
                break;
              case 409:
                setMessage(translations[language].conflictingReservation);
                break;
              case 500:
                setMessage(translations[language].serverError);
                break;
              default:
                setMessage(translations[language].unknownError);
            }
          } else if (error.request) {
            setMessage(translations[language].networkError);
          } else {
            setMessage(translations[language].unknownError);
          }
        }
      } else {
        setMessage(translations[language].invalidDateTime);
      }
    } else {
      setMessage(translations[language].captchaError);
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
                onChange={(e) => setSelectedPsychologist(e.target.value)}
                required
              >
                <option value="" disabled>Select a psychologist</option>
                {psychologists.map(psychologist => (
                  <option key={psychologist.id} value={psychologist.id.toString()}>
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
                  type="text"
                  value={getDisplayTime()}
                  readOnly
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
            <div className="button-container">
            {isLoggedIn && selectedPsychologist && !hasSuggestion && (
              <button 
                type="button" 
                className="suggest-btn" 
                onClick={handleSuggestReservation}
                disabled={isWaitingForSuggestion}
              >
                {isWaitingForSuggestion 
                  ? translations[language].pleaseWait
                  : translations[language].suggestReservation
                }
              </button>
            )}
              <button type="submit">{translations[language].reserve}</button>
            </div>
          </form>
          {message && <p className="confirmation-message">{message}</p>}
        </div>
      </div>
      <div className="calendar-column" ref={calendarRef}>
      <ReservationCalendar 
        onTimeSelect={handleTimeSelect} 
        selectedPsychologist={selectedPsychologist}
        workingHours={workingHours}
      />
      </div>
    </div>
  );
}

export default ReservationPanel;
