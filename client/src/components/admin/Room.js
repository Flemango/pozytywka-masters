import React, { useState } from 'react';
import Axios from 'axios';
import './Room.css';

const Room = ({ room: initialRoom, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [room, setRoom] = useState(initialRoom);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this room?");
    if (confirmed) {
      onDelete(room.id);
    }
  };

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditedValue(value);
  };

  const handleSaveField = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await Axios.patch(`http://localhost:5000/admin/rooms/${room.id}`, {
        [editingField]: editedValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(prev => ({ ...prev, [editingField]: editedValue }));
      onUpdate(room.id, { [editingField]: editedValue });
      setEditingField(null);
      setEditedValue('');
    } catch (error) {
      console.error("Error saving room detail:", error);
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
            {room[field]}
            <button className="edit-button" onClick={() => handleEditField(field, room[field])}>Edit</button>
          </span>
        )}
      </p>
    );
  };

  return (
    <div className="room-container">
      <div className="room-header" onClick={toggleExpand}>
        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>&#9654;</span>
        <span>Room nr {room.room_number}</span>
      </div>
      {isExpanded && (
        <div className="room-details">
          {renderEditableField('room_number', 'Room Number')}
          {renderEditableField('capacity', 'Capacity')}
          <button className="delete-button" onClick={handleDelete}>Delete Room</button>
        </div>
      )}
    </div>
  );
};

export default Room;