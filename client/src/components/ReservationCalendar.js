import React, { useContext, useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';
import { format, isSameDay, parseISO, addHours, addMinutes, isWithinInterval, parse, isBefore, isAfter, startOfDay } from 'date-fns';
import { LanguageContext } from '../context/LanguageContext';
import axios from 'axios';

const translations = {
  EN: {
    avail_hours: 'Available hours on ',
    no_avail: 'No available hours.',
    select_psychologist: 'Please select a psychologist.',
    select_duration: 'Select duration:',
    go_back: 'Go back',
    hour: 'hour',
    hours: 'hours'
  },
  PL: {
    avail_hours: 'Wolne terminy dla ',
    no_avail: 'Brak wolnych terminów.',
    select_psychologist: 'Proszę wybrać psychologa.',
    select_duration: 'Wybierz czas trwania:',
    go_back: 'Wróć',
    hour: 'godzina',
    hours: 'godziny'
  }
};

const ReservationCalendar = ({ onTimeSelect, selectedPsychologist, workingHours }) => {
  const [date, setDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableDurations, setAvailableDurations] = useState([]);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchReservations = async () => {
      if (selectedPsychologist) {
        try {
          const response = await axios.get(`http://localhost:5000/get-reservations`, {
            params: {
              psychologistId: selectedPsychologist,
              date: format(date, 'yyyy-MM-dd')
            }
          });
          setReservations(response.data);
        } catch (error) {
          console.error('Error fetching reservations:', error);
        }
      }
    };

    fetchReservations();
  }, [selectedPsychologist, date]);

  useEffect(() => {
    if (selectedPsychologist) {
      const dayOfWeek = format(date, 'EEEE');
      const dayHours = workingHours[selectedPsychologist]?.[dayOfWeek] || [];
      
      let allTimes = [];
      dayHours.forEach(hour => {
        let currentTime = parse(hour.start, 'HH:mm', new Date());
        const endTime = parse(hour.end, 'HH:mm', new Date());
        while (isBefore(currentTime, endTime)) {
          allTimes.push(format(currentTime, 'HH:mm'));
          currentTime = addHours(currentTime, 1);
        }
      });

      const reservedIntervals = reservations.map(reservation => {
        const start = new Date(`${reservation.reservation_date}`);
        const temp = addHours(start, reservation.duration);
        const end = addMinutes(temp, -1);
        return { start, end };
      });

      const now = new Date();
      const isToday = isSameDay(date, now);
      const oneHourFromNow = addHours(now, 1);

      const timesAvailable = allTimes.filter(time => {
        const timeSlot = parse(`${format(date, 'yyyy-MM-dd')} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
        return !reservedIntervals.some(interval => 
          isWithinInterval(timeSlot, { start: interval.start, end: interval.end })
        ) && (!isToday || isAfter(timeSlot, oneHourFromNow));
      });

      setAvailableTimes(timesAvailable);
    } else {
      setAvailableTimes([]);
    }
  }, [date, selectedPsychologist, workingHours, reservations]);

  const isDateDisabled = ({ date }) => {
    if (!selectedPsychologist) return true;
    
    const now = new Date();
    if (isBefore(date, startOfDay(now))) return true;

    const dayOfWeek = format(date, 'EEEE');
    const dayHours = workingHours[selectedPsychologist]?.[dayOfWeek] || [];
    if (dayHours.length === 0) return true;

    const reservedTimes = reservations.filter(reservation => 
      isSameDay(parseISO(reservation.reservation_date), date)
    );

    // Calculate total available hours
    const totalHours = dayHours.reduce((total, hour) => {
      const start = parse(hour.start, 'HH:mm', new Date());
      const end = parse(hour.end, 'HH:mm', new Date());
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    return reservedTimes.length >= totalHours;
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    
    // Find the index of the selected time in availableTimes
    const selectedIndex = availableTimes.indexOf(time);
    
    // Count consecutive available hours after the selected time
    let consecutiveHours = 0;
    for (let i = selectedIndex; i < availableTimes.length; i++) {
      if (i === selectedIndex || 
          parse(availableTimes[i], 'HH:mm', new Date()).getHours() === 
          parse(availableTimes[i-1], 'HH:mm', new Date()).getHours() + 1) {
        consecutiveHours++;
      } else {
        break;
      }
    }

    // Limit available durations to avoid collisions
    const maxDuration = Math.min(consecutiveHours, 3);
    setAvailableDurations(Array.from({length: maxDuration}, (_, i) => i + 1));
  };

  const handleDurationSelect = (duration) => {
    onTimeSelect(date, selectedTime, duration);
    setSelectedTime(null);
  };

  const handleGoBack = () => {
    setSelectedTime(null);
  };

  return (
    <div>
      <Calendar
        onChange={setDate}
        value={date}
        tileDisabled={isDateDisabled}
        minDate={new Date()}
      />
      <div className={selectedTime ? "duration-options" : "available-times"}>
        <h3>
          {selectedTime 
            ? translations[language].select_duration
            : `${translations[language].avail_hours}${format(date, 'yyyy-MM-dd')}`
          }
        </h3>
        {selectedPsychologist ? (
          selectedTime ? (
            <>
              <ul>
                {availableDurations.map(duration => (
                  <li key={duration} onClick={() => handleDurationSelect(duration)}>
                    {duration} {duration === 1 ? translations[language].hour : translations[language].hours}
                  </li>
                ))}
              </ul>
              <button className="go-back-button" onClick={handleGoBack}>{translations[language].go_back}</button>
            </>
          ) : availableTimes.length > 0 ? (
            <ul>
              {availableTimes.map(time => (
                <li key={time} onClick={() => handleTimeClick(time)}>{time}</li>
              ))}
            </ul>
          ) : (
            <p>{translations[language].no_avail}</p>
          )
        ) : (
          <p>{translations[language].select_psychologist}</p>
        )}
      </div>
    </div>
  );
};

export default ReservationCalendar;