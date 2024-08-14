// src/components/Client.js
import React, { useState } from 'react';
import Axios from 'axios';
import './Client.css';

const Client = ({ client, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete the client's data?");
    if (confirmed) {
      try {
        await Axios.delete(`http://localhost:5000/clients/${client.id}`);
        onDelete(client.id);
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const formatReservationInfo = () => {
    if (client.reservation_date) {
      const date = new Date(client.reservation_date);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Last reservation: ${formattedDate} ${formattedTime}, Room ${client.room_number} with ${client.psychologist_first_name} ${client.psychologist_last_name}`;
    }
    return 'No reservation information available';
  };

  return (
    <div className="client-container">
      <div className="client-header" onClick={toggleExpand}>
        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>&#9654;</span>
        <span>{client.first_name} {client.last_name}</span>
      </div>
      {isExpanded && (
        <div className="client-details">
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Phone Number:</strong> {client.phone_number}</p>
          <p><strong>Reservation:</strong> {formatReservationInfo()}</p>
          <button className="delete-button" onClick={handleDelete}>Delete Client</button>
        </div>
      )}
    </div>
  );
};

export default Client;