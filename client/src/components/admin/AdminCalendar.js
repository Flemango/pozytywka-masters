import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';

function AdminCalendar({ reservations: initialReservations }) {
  const [selectedDates, setSelectedDates] = useState(new Date());
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  
  const handleDateChange = (date) => {
    setSelectedDates(date);
  };

  const toggleSelectionMode = () => {
    setIsRangeMode(!isRangeMode);
    setSelectedDates(new Date());
  };

  const getReservationsForRange = (start, end) => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return reservationDate >= start && reservationDate <= end;
    });
  };

  const getReservationsToShow = () => {
    if (Array.isArray(selectedDates)) {
      return getReservationsForRange(selectedDates[0], selectedDates[1]);
    } else {
      return reservations.filter(reservation => 
        isSameDay(new Date(reservation.date), selectedDates)
      );
    }
  };

  const isReservationSelected = (reservation) => {
    const reservationDate = new Date(reservation.date);
    if (Array.isArray(selectedDates)) {
      return reservationDate >= selectedDates[0] && reservationDate <= selectedDates[1];
    } else {
      return isSameDay(reservationDate, selectedDates);
    }
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const moveReservation = (reservationIndex, direction) => {
    const updatedReservations = reservations.map((reservation, index) => {
      if (index === reservationIndex) {
        const newDate = new Date(reservation.date);
        newDate.setDate(newDate.getDate() + direction);
        return { ...reservation, date: newDate.toISOString().split('T')[0] };
      }
      return reservation;
    });
    setReservations(updatedReservations);
  };

  const moveReservations = (direction) => {
    const updatedReservations = reservations.map(reservation => {
      if (isReservationSelected(reservation)) {
        const newDate = new Date(reservation.date);
        newDate.setDate(newDate.getDate() + direction);
        return { ...reservation, date: newDate.toISOString().split('T')[0] };
      }
      return reservation;
    });
    setReservations(updatedReservations);
  };

  const deleteReservation = (reservationIndex) => {
    const reservationToDelete = reservations[reservationIndex];
    const confirmMessage = `Are you sure you want to delete the reservation for ${reservationToDelete.name} on ${reservationToDelete.date} at ${reservationToDelete.time}?`;
    
    if (window.confirm(confirmMessage)) {
      const updatedReservations = reservations.filter((_, index) => index !== reservationIndex);
      setReservations(updatedReservations);
    }
  };

  const deleteReservations = () => {
    let confirmMessage;
    if (Array.isArray(selectedDates)) {
      confirmMessage = `Are you sure you want to delete all reservations from ${selectedDates[0].toDateString()} to ${selectedDates[1].toDateString()}?`;
    } else {
      confirmMessage = `Are you sure you want to delete all reservations for ${selectedDates.toDateString()}?`;
    }
  
    if (window.confirm(confirmMessage)) {
      const updatedReservations = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        if (Array.isArray(selectedDates)) {
          return reservationDate < selectedDates[0] || reservationDate > selectedDates[1];
        } else {
          return !isSameDay(reservationDate, selectedDates);
        }
      });
      setReservations(updatedReservations);
    }
  };

  const moveLeft = () => moveReservations(-1);
  const moveRight = () => moveReservations(1);
  const moveWeekForward = () => moveReservations(7);

  const reservationsToShow = getReservationsToShow();
  
  return (
    <div>
      <div className="admin-calendar">
        <div className="calendar-container">
          <Calendar
            value={selectedDates}
            onChange={handleDateChange}
            selectRange={isRangeMode}
            tileContent={({ date, view }) => {
              const dayReservations = getReservationsForRange(date, date);
              return view === 'month' && dayReservations.length > 0 ? (
                <div className="reservation-badge">
                  {dayReservations.length} Reservations
                </div>
              ) : null;
            }}
          />
        </div>
        <div className="reservation-info">
          <h2>
            {isRangeMode && Array.isArray(selectedDates)
              ? `Reservations from ${selectedDates[0].toDateString()} to ${selectedDates[1].toDateString()}`
              : `Reservations for ${selectedDates.toDateString()}`}
          </h2>
          {reservationsToShow.length > 0 ? (
            <ul>
              {reservationsToShow.map((reservation, index) => (
                <li key={index}>
                  <strong>{reservation.date}</strong> {reservation.time} - {reservation.name} ({reservation.email})
                  <div className="reservation-actions">
                    <button onClick={() => moveReservation(index, -1)} className="move-btn">←</button>
                    <button onClick={() => moveReservation(index, 1)} className="move-btn">→</button>
                    <button onClick={() => moveReservation(index, 7)} className="move-btn">+7</button>
                    <button onClick={() => deleteReservation(index)} className="delete-btn">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-reservations">No reservations for this period.</p>
          )}
        </div>
      </div>
      <div className="global-actions">
        <button className="toggle-selectionmode-btn" onClick={toggleSelectionMode}>
          {isRangeMode ? 'Switch to Single Day' : 'Switch to Range'}
        </button>
        <button className="move-btn" onClick={moveLeft}>{"◄"}</button>
        <button className="move-btn" onClick={moveRight}>{"►"}</button>
        <button className="move-btn" onClick={moveWeekForward}>+7</button>
        <button className="delete-btn" onClick={deleteReservations}>Delete</button>
      </div>
    </div>
  );
}

export default AdminCalendar;