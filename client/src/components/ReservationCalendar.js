import React, { useContext, useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';
import { format, isSameDay } from 'date-fns';
import { LanguageContext } from '../context/LanguageContext';

const translations = {
  EN: {
    avail_hours: 'Available hours on ',
    no_avail: 'No available hours.',
    select_psychologist: 'Please select a psychologist.'
  },
  PL: {
    avail_hours: 'Wolne terminy dla ',
    no_avail: 'Brak wolnych terminów.',
    select_psychologist: 'Proszę wybrać psychologa.'
  }
};

const reservations = [
  { date: new Date(2023, 6, 21), time: '15:00', psychologistId: 1 },
  { date: new Date(2023, 6, 21), time: '16:00', psychologistId: 1 },
  { date: new Date(2023, 6, 22), time: '15:00', psychologistId: 2 },
];

const ReservationCalendar = ({ onTimeSelect, selectedPsychologist, workingHours }) => {
  const [date, setDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (selectedPsychologist) {
      const dayOfWeek = format(date, 'EEEE');
      const dayHours = workingHours[selectedPsychologist]?.[dayOfWeek] || [];
      
      let allTimes = [];
      dayHours.forEach(hour => {
        let currentTime = new Date(`1970-01-01T${hour.start}`);
        const endTime = new Date(`1970-01-01T${hour.end}`);
        while (currentTime < endTime) {
          allTimes.push(format(currentTime, 'HH:mm'));
          currentTime.setMinutes(currentTime.getMinutes() + 60); // Assuming 1-hour slots
        }
      });

      const reservedTimes = reservations
        .filter(reservation => 
          isSameDay(reservation.date, date) && 
          reservation.psychologistId === selectedPsychologist
        )
        .map(reservation => reservation.time);

      const timesAvailable = allTimes.filter(time => !reservedTimes.includes(time));

      setAvailableTimes(timesAvailable);
    } else {
      setAvailableTimes([]);
    }
  }, [date, selectedPsychologist, workingHours]);

  const isDateDisabled = ({ date }) => {
    if (!selectedPsychologist) return true;
    
    const dayOfWeek = format(date, 'EEEE');
    const dayHours = workingHours[selectedPsychologist]?.[dayOfWeek] || [];
    if (dayHours.length === 0) return true;

    const reservedTimes = reservations.filter(reservation => 
      isSameDay(reservation.date, date) && 
      reservation.psychologistId === selectedPsychologist
    );

    // Calculate total available hours
    const totalHours = dayHours.reduce((total, hour) => {
      const start = new Date(`1970-01-01T${hour.start}`);
      const end = new Date(`1970-01-01T${hour.end}`);
      return total + (end - start) / (1000 * 60 * 60);
    }, 0);

    return reservedTimes.length >= totalHours;
  };

  return (
    <div>
      <Calendar
        onChange={setDate}
        value={date}
        tileDisabled={isDateDisabled}
      />
      <div className="available-times">
        <h3>{translations[language].avail_hours}{format(date, 'yyyy-MM-dd')}</h3>
        {selectedPsychologist ? (
          availableTimes.length > 0 ? (
            <ul>
              {availableTimes.map(time => (
                <li key={time} onClick={() => onTimeSelect(date, time)}>{time}</li>
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