import React, { useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';
import ReservationCreator from './ReservationCreator';

function AdminCalendar({ reservations: initialReservations }) {
  const [selectedDates, setSelectedDates] = useState(new Date());
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [clients, setClients] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [rooms, setRooms] = useState([]);
  
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

  const handleAddReservation = async () => {
    setIsCreatingReservation(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
  
      // Fetch clients
      const clientsResponse = await axios.get('http://localhost:5000/admin-calendar/clients', { headers });
      setClients(clientsResponse.data);
  
      // Fetch psychologists
      const psychologistsResponse = await axios.get('http://localhost:5000/admin-calendar/psychologists', { headers });
      setPsychologists(psychologistsResponse.data);

      // Fetch rooms
      const roomsResponse = await axios.get('http://localhost:5000/admin-calendar/rooms', { headers });
      setRooms(roomsResponse.data);
  
    } catch (error) {
      console.error('Error fetching data for reservation creation:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleConfirmReservation = async (newReservation) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:5000/admin-calendar/confirm_reservation', newReservation, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Assuming the backend returns the created reservation
      const createdReservation = response.data;
      setReservations([...reservations, createdReservation]);
      setIsCreatingReservation(false);
    } catch (error) {
      console.error('Error creating reservation:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleCancelReservation = () => {
    setIsCreatingReservation(false);
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
          {isCreatingReservation ? (
            <ReservationCreator
              date={Array.isArray(selectedDates) ? selectedDates[0] : selectedDates}
              clients={clients}
              psychologists={psychologists}
              rooms={rooms}
              availableHours={availableHours}
              onConfirm={handleConfirmReservation}
              onCancel={handleCancelReservation}
            />
          ) : (
            <>
              <div className="reservation-header">
                <h2>
                  {isRangeMode && Array.isArray(selectedDates)
                    ? `Reservations from ${selectedDates[0].toDateString()} to ${selectedDates[1].toDateString()}`
                    : `Reservations for ${selectedDates.toDateString()}`}
                </h2>
                <button className="add-reservation-btn" onClick={handleAddReservation}>+</button>
              </div>
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
            </>
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