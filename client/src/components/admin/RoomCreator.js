import React, { useState } from 'react';
import './RoomCreator.css';

const RoomCreator = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    room_number: '',
    capacity: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="add-room-form">
      <h2>Add New Room</h2>
      <input
        type="text"
        name="room_number"
        value={formData.room_number}
        onChange={handleChange}
        placeholder="Room Number"
        required
      />
      <input
        type="number"
        name="capacity"
        value={formData.capacity}
        onChange={handleChange}
        placeholder="Capacity"
        required
      />
      <div className="form-buttons">
        <button type="submit">Create</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default RoomCreator;