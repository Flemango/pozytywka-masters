import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';
import ReservationCreator from './ReservationCreator';

const BASE_URL = 'http://localhost:5000/admin-calendar';

function AdminCalendar() {
  const [selectedDates, setSelectedDates] = useState(new Date());
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [reservations, setReservations] = useState([]);
  
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [clients, setClients] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      window.Error('Failed to fetch reservations');
    }
  };

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

  const moveReservation = async (reservationId, direction) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) {
        console.error('Reservation not found');
        return;
      }
  
      const currentDate = new Date(reservation.date);
      currentDate.setDate(currentDate.getDate() + direction);
      
      const newDate = currentDate.toISOString().split('T')[0];
      const time = reservation.time; // Assuming the time doesn't change
  
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.put(`${BASE_URL}/reservations/${reservationId}`, 
        { date: newDate, time: time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data) {
        setReservations(currentReservations => 
          currentReservations.map(r => 
            r.id === reservationId ? { ...r, date: response.data.date, time: response.data.time } : r
          )
        );
        fetchReservations();
      }
    } catch (error) {
      console.error('Error moving reservation:', error);
    }
  };

  const deleteReservation = async (reservationId) => {
    const reservationToDelete = reservations.find(r => r.id === reservationId);
    const confirmMessage = `Are you sure you want to delete the reservation for ${reservationToDelete.name} on ${reservationToDelete.date} at ${reservationToDelete.time}?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const token = sessionStorage.getItem('accessToken');
        await axios.delete(`${BASE_URL}/reservations/${reservationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(reservations.filter(r => r.id !== reservationId));
      } catch (error) {
        console.error('Error deleting reservation:', error);
      }
    }
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
  
      const [clientsResponse, psychologistsResponse, roomsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/clients`, { headers }),
        axios.get(`${BASE_URL}/psychologists`, { headers }),
        axios.get(`${BASE_URL}/rooms`, { headers })
      ]);

      setClients(clientsResponse.data);
      setPsychologists(psychologistsResponse.data);
      setRooms(roomsResponse.data);
      fetchReservations();
    } catch (error) {
      console.error('Error fetching data for reservation creation:', error);
    }
  };

  const handleConfirmReservation = async (newReservation) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:5000/admin-calendar/confirm-reservation', newReservation, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Assuming the backend returns the created reservation
      const createdReservation = response.data;
      setReservations([...reservations, createdReservation]);
      setIsCreatingReservation(false);
      fetchReservations();
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
              if (view === 'month') {
                const dayReservations = getReservationsForRange(date, new Date(date.getTime() + 86400000 - 1));
                if (dayReservations.length > 0) {
                  return (
                    <div className="reservation-badge">
                      {dayReservations.length}
                    </div>
                  );
                }
              }
              return null;
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
                 {reservationsToShow.map((reservation) => (
                  <li key={reservation.id} className="reservation-item">
                    <strong>{reservation.formattedDate}</strong> {reservation.time} - {reservation.duration}h
                    <br />
                    <strong>Client:</strong> {reservation.name} ({reservation.email})
                    <br />
                    <strong>Psychologist:</strong> {reservation.psychologist}
                    <br /> 
                    <strong>Room:</strong> {reservation.room}
                    <br />
                    <strong>Status:</strong> {reservation.status}
                    <div className="reservation-actions">
                      <button onClick={() => moveReservation(reservation.id, -1)} className="move-btn">←</button>
                      <button onClick={() => moveReservation(reservation.id, 1)} className="move-btn">→</button>
                      <button onClick={() => moveReservation(reservation.id, 7)} className="move-btn">+7</button>
                      <button onClick={() => deleteReservation(reservation.id)} className="delete-btn">Delete</button>
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