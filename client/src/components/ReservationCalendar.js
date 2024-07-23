import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';
import { format, isSameDay } from 'date-fns';

export const openingHours = {
  Monday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
  Tuesday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
  Wednesday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
  Thursday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
  Friday: ['15:00', '16:00', '17:00', '18:00', '19:00'],
  Saturday: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
  Sunday: [],
};

const reservations = [
  { date: new Date(2023, 6, 21), time: '15:00' },
  { date: new Date(2023, 6, 21), time: '16:00' },
  { date: new Date(2023, 6, 22), time: '15:00' },
];

const ReservationCalendar = ({ onTimeSelect }) => {
  const [date, setDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const dayOfWeek = format(date, 'EEEE');
    const times = openingHours[dayOfWeek] || [];

    const reservedTimes = reservations
      .filter(reservation => isSameDay(reservation.date, date))
      .map(reservation => reservation.time);

    const timesAvailable = times.filter(time => !reservedTimes.includes(time));

    setAvailableTimes(timesAvailable);
  }, [date]);

  const isDateDisabled = ({ date }) => {
    const dayOfWeek = format(date, 'EEEE');
    if (dayOfWeek === 'Sunday') return true;

    const reservedTimes = reservations.filter(reservation => isSameDay(reservation.date, date));
    return reservedTimes.length >= openingHours[dayOfWeek].length;
  };

  return (
    <div>
      <Calendar
        onChange={setDate}
        value={date}
        tileDisabled={isDateDisabled}
      />
      <div className="available-times">
        <h3>Available Times on {format(date, 'yyyy-MM-dd')}</h3>
        {availableTimes.length > 0 ? (
          <ul>
            {availableTimes.map(time => (
              <li key={time} onClick={() => onTimeSelect(date, time)}>{time}</li>
            ))}
          </ul>
        ) : (
          <p>No available times.</p>
        )}
      </div>
    </div>
  );
};

export default ReservationCalendar;
