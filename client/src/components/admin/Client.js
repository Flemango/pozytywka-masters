import React, { useState } from 'react';
import Axios from 'axios';
import './Client.css';

const Client = ({ client: initialClient, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [client, setClient] = useState(initialClient);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete the client's data?");
    if (confirmed) {
      try {
        const token = sessionStorage.getItem('accessToken');

        if (!token) {
          throw new Error('No authentication token found');
        }

        await Axios.delete(`http://localhost:5000/admin/clients/${client.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        onDelete(client.id);
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const formatReservationInfo = (date, status, room, psychologistFirstName, psychologistLastName) => {
    if (date) {
      const reservationDate = new Date(date);
      const formattedDate = reservationDate.toLocaleDateString();
      const formattedTime = reservationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${formattedDate} ${formattedTime}, Room ${room} with ${psychologistFirstName} ${psychologistLastName} (${status})`;
    }
    return 'No reservation';
  };

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditedValue(value);
  };

  const handleSaveField = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      await Axios.patch(`http://localhost:5000/admin/clients/${client.id}`, {
        [editingField]: editedValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClient(prev => ({ ...prev, [editingField]: editedValue }));
      setEditingField(null);
      setEditedValue('');
    } catch (error) {
      console.error("Error saving client detail:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditedValue('');
  };

  const renderEditableField = (field, label) => {
    const isEditing = editingField === field;
    return (
      <p className="editable-field" key={field}>
        <strong>{label}: </strong> 
        {isEditing ? (
          <>
            <input 
              value={editedValue} 
              onChange={(e) => setEditedValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveField()}
            />
            <button onClick={handleSaveField}>Save</button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </>
        ) : (
          <span className="editable-value">
            {client[field]}
            <button className="edit-button" onClick={() => handleEditField(field, client[field])}>Edit</button>
          </span>
        )}
      </p>
    );
  };

  return (
    <div className="client-container">
      <div className="client-header" onClick={toggleExpand}>
        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>&#9654;</span>
        <span>{client.first_name} {client.last_name}</span>
      </div>
      {isExpanded && (
        <div className="client-details">
          {renderEditableField('first_name', 'First Name')}
          {renderEditableField('last_name', 'Last Name')}
          {renderEditableField('email', 'Email')}
          {renderEditableField('phone_number', 'Phone Number')}
          <p><strong>Last Reservation:</strong> {formatReservationInfo(
            client.last_reservation_date,
            client.last_reservation_status,
            client.last_reservation_room,
            client.last_reservation_psychologist_first_name,
            client.last_reservation_psychologist_last_name
          )}</p>
          <p><strong>Upcoming Reservation:</strong> {formatReservationInfo(
            client.upcoming_reservation_date,
            client.upcoming_reservation_status,
            client.upcoming_reservation_room,
            client.upcoming_reservation_psychologist_first_name,
            client.upcoming_reservation_psychologist_last_name
          )}</p>
          <button className="delete-button" onClick={handleDelete}>Delete Client</button>
        </div>
      )}
    </div>
  );
};

export default Client;