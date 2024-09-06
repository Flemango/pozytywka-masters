import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReservationCreator({ date, clients, psychologists, rooms, onConfirm, onCancel }) {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [appointmentLength, setAppointmentLength] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [availableDurations, setAvailableDurations] = useState([]);
  const [existingReservations, setExistingReservations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    if (selectedPsychologist) {
      fetchAvailableHours();
      fetchAllReservations();
    }
  }, [selectedPsychologist, date]);

  useEffect(() => {
    if (selectedHour) {
      updateAvailableDurations();
    }
  }, [selectedHour, availableHours, existingReservations]);

  useEffect(() => {
    if (appointmentLength) {
      updateAvailableRooms();
    }
  }, [appointmentLength, selectedHour, existingReservations]);

  const fetchAvailableHours = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const formattedDate = formatDate(date);
      const response = await axios.get(`http://localhost:5000/admin-calendar/available-hours`, {
        params: {
          date: formattedDate,
          psychologist_id: selectedPsychologist
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableHours(response.data);
    } catch (error) {
      console.error('Error fetching available hours:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const fetchAllReservations = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const formattedDate = formatDate(date);
      const response = await axios.get(`http://localhost:5000/admin-calendar/existing-reservations`, {
        params: {
          date: formattedDate
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingReservations(response.data);
    } catch (error) {
      console.error('Error fetching all reservations:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const updateAvailableDurations = () => {
    if (!selectedHour || availableHours.length === 0) return;
  
    const selectedTime = new Date(`${formatDate(date)}T${selectedHour}`);
    const durations = [];
  
    for (let i = 1; i <= 3; i++) {
      const endTime = new Date(selectedTime.getTime() + i * 60 * 60 * 1000);

      let isAvailable = true;
      for (let j = 0; j < i; j++) {
        const currentTime = new Date(selectedTime.getTime() + j * 60 * 60 * 1000);
        const currentHour = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
  
        if (!availableHours.includes(currentHour)) {
          isAvailable = false;
          break;
        }
      }
  
      if (!isAvailable) break;
  
      const hasCollision = existingReservations.some(reservation => {
        if (reservation.psychologist_id === selectedPsychologist) {
          const reservationStart = new Date(`${formatDate(date)}T${reservation.time}`);
          const reservationEnd = new Date(reservationStart.getTime() + reservation.duration * 60 * 60 * 1000);
          return !(endTime <= reservationStart || selectedTime >= reservationEnd);
        }
        return false;
      });
  
      if (hasCollision) break;
  
      durations.push(i.toString());
    }
  
    setAvailableDurations(durations);
    setAppointmentLength('');
  };

  const updateAvailableRooms = () => {
    if (!selectedHour || !appointmentLength) return;

    const selectedTime = new Date(`${formatDate(date)}T${selectedHour}`);
    const endTime = new Date(selectedTime.getTime() + parseInt(appointmentLength) * 60 * 60 * 1000);

    const availableRooms = rooms.filter(room => {
      const roomIsAvailable = !existingReservations.some(reservation => {
        const reservationStart = new Date(`${formatDate(date)}T${reservation.time}`);
        const reservationEnd = new Date(reservationStart.getTime() + reservation.duration * 60 * 60 * 1000);
        return (
          reservation.room_id === room.id &&
          !(endTime <= reservationStart || selectedTime >= reservationEnd)
        );
      });
      return roomIsAvailable;
    });

    setAvailableRooms(availableRooms);
    setSelectedRoom('');
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    const formattedDate = formatDate(date);
    onConfirm({
      date: formattedDate,
      client_id: selectedClient,
      psychologist_id: selectedPsychologist,
      room_id: selectedRoom,
      time: selectedHour,
      duration: parseInt(appointmentLength)
    });
  };

  return (
    <div className="reservation-creator">
      <h2>Create Reservation for {date.toDateString()}</h2>
      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
        <option value="">Select Client</option>
        {clients.map(client => (
          <option key={client.id} value={client.id}>{client.first_name} {client.last_name}</option>
        ))}
      </select>
      <select value={selectedPsychologist} onChange={(e) => setSelectedPsychologist(e.target.value)}>
        <option value="">Select Psychologist</option>
        {psychologists.map(psych => (
          <option key={psych.id} value={psych.id}>{psych.first_name} {psych.last_name}</option>
        ))}
      </select>
      <select 
        value={selectedHour} 
        onChange={(e) => setSelectedHour(e.target.value)}
        disabled={!selectedPsychologist}
      >
        <option value="">Select Time</option>
        {availableHours.map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <select
        value={appointmentLength}
        onChange={(e) => setAppointmentLength(e.target.value)}
        disabled={!selectedHour}
      >
        <option value="">Select Duration</option>
        {availableDurations.map(duration => (
          <option key={duration} value={duration}>{duration} hour{duration !== '1' ? 's' : ''}</option>
        ))}
      </select>
      <select 
        value={selectedRoom} 
        onChange={(e) => setSelectedRoom(e.target.value)}
        disabled={!appointmentLength}
      >
        <option value="">Select Room</option>
        {availableRooms.map(room => (
          <option key={room.id} value={room.id}>{room.room_number}</option>
        ))}
      </select>
      <div className="reservation-creator-actions">
        <button onClick={handleConfirm} disabled={!selectedClient || !selectedPsychologist || !selectedHour || !appointmentLength || !selectedRoom}>Confirm Reservation</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ReservationCreator;