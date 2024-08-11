import React, { useContext, useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';
import { format, isSameDay } from 'date-fns';
import { LanguageContext } from '../context/LanguageContext';

export const openingHours = {
  1: { // Dr. Emily Brown
    Monday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
    Tuesday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
    Wednesday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
    Thursday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
    Friday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
    Saturday: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    Sunday: [],
  },
  2: { // Dr. Michael Johnson
    Monday: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    Tuesday: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    Wednesday: ['14:00', '15:00', '16:00', '17:00', '18:00'],
    Thursday: ['14:00', '15:00', '16:00', '17:00', '18:00'],
    Friday: ['09:00', '10:00', '11:00', '12:00', '13:00'],
    Saturday: ['10:00', '11:00', '12:00', '13:00', '14:00'],
    Sunday: [],
  },
};

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

const ReservationCalendar = ({ onTimeSelect, selectedPsychologist }) => {
  const [date, setDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (selectedPsychologist) {
      const dayOfWeek = format(date, 'EEEE');
      const times = openingHours[selectedPsychologist]?.[dayOfWeek] || [];

      const reservedTimes = reservations
        .filter(reservation => 
          isSameDay(reservation.date, date) && 
          reservation.psychologistId === selectedPsychologist
        )
        .map(reservation => reservation.time);

      const timesAvailable = times.filter(time => !reservedTimes.includes(time));

      setAvailableTimes(timesAvailable);
    } else {
      setAvailableTimes([]);
    }
  }, [date, selectedPsychologist]);

  const isDateDisabled = ({ date }) => {
    if (!selectedPsychologist) return true;
    
    const dayOfWeek = format(date, 'EEEE');
    if (!openingHours[selectedPsychologist][dayOfWeek] || openingHours[selectedPsychologist][dayOfWeek].length === 0) return true;

    const reservedTimes = reservations.filter(reservation => 
      isSameDay(reservation.date, date) && 
      reservation.psychologistId === selectedPsychologist
    );
    return reservedTimes.length >= openingHours[selectedPsychologist][dayOfWeek].length;
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