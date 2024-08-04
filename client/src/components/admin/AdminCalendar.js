import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';

function AdminCalendar({ reservations }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getReservationsForDay = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return reservations.filter(reservation => reservation.date === dateString);
  };

  const dayReservations = getReservationsForDay(selectedDate);
  
  return (
    <div className="admin-calendar">
      <div className="calendar-container">
        <Calendar
          value={selectedDate}
          onClickDay={handleDateClick}
          tileContent={({ date, view }) => {
            const dayReservations = getReservationsForDay(date);
            return view === 'month' && dayReservations.length > 0 ? (
              <div className="reservation-badge">
                {dayReservations.length} Reservations
              </div>
            ) : null;
          }}
        />
      </div>
      <div className="reservation-info">
        <h2>Reservations for {selectedDate.toDateString()}</h2>
        {dayReservations.length > 0 ? (
          <ul>
            {dayReservations.map((reservation, index) => (
              <li key={index}>
                <strong>{reservation.time}</strong> - {reservation.name} ({reservation.email})
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-reservations">No reservations for this day.</p>
        )}
      </div>
    </div>
  );
}

export default AdminCalendar;
