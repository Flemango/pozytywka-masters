import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReservationCreator({ date, clients, psychologists, rooms, onConfirm, onCancel }) {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPsychologist, setSelectedPsychologist] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [appointmentLength, setAppointmentLength] = useState('1');
  const [availableHours, setAvailableHours] = useState([]);

  useEffect(() => {
    if (selectedPsychologist) {
      fetchAvailableHours();
    }
  }, [selectedPsychologist, date]);

  const fetchAvailableHours = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:5000/admin-calendar/available-hours`, {
        params: {
          date: date.toISOString().split('T')[0],
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

  const handleConfirm = () => {
    onConfirm({
      date: date.toISOString().split('T')[0],
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
      >
        <option value="1">1 hour</option>
        <option value="2">2 hours</option>
        <option value="3">3 hours</option>
      </select>
      <select 
        value={selectedRoom} 
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">Select Room</option>
        {rooms.map(room => (
          <option key={room.id} value={room.id}>{room.room_number}</option>
        ))}
      </select>
      <div className="reservation-creator-actions">
        <button onClick={handleConfirm} disabled={!selectedClient || !selectedPsychologist || !selectedHour || !appointmentLength}>Confirm Reservation</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ReservationCreator;