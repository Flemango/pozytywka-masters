import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './Psychologist.css';

const Psychologist = ({ psychologist: initialPsychologist, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [workingHours, setWorkingHours] = useState({});
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [editedHours, setEditedHours] = useState({});
  const [psychologist, setPsychologist] = useState(initialPsychologist);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [rooms, setRooms] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (isExpanded && Object.keys(workingHours).length === 0) {
      fetchWorkingHours();
    }
    fetchRooms();
  }, [isExpanded]);

  const fetchWorkingHours = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await Axios.get(`http://localhost:5000/admin/psychologists/${psychologist.id}/hours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const hours = response.data.reduce((acc, hour) => {
        const dayName = daysOfWeek[hour.day_of_week - 1];
        acc[dayName] = { start: hour.start_time.slice(0, 5), end: hour.end_time.slice(0, 5) };
        return acc;
      }, {});
      setWorkingHours(hours);
      setEditedHours(hours);
    } catch (error) {
      console.error("Error fetching working hours:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await Axios.get(`http://localhost:5000/admin/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort rooms by room number
      const sortedRooms = response.data.sort((a, b) => {
        return parseInt(a.room_number) - parseInt(b.room_number);
      });
      setRooms(sortedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePreferredRoomChange = async (e) => {
    const newPreferredRoomId = e.target.value;
    try {
      const token = sessionStorage.getItem('accessToken');
      await Axios.patch(`http://localhost:5000/admin/psychologists/${psychologist.id}`, {
        preferred_room_id: newPreferredRoomId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPsychologist(prev => ({ 
        ...prev, 
        preferred_room_id: newPreferredRoomId,
        preferred_room_number: rooms.find(room => room.id.toString() === newPreferredRoomId)?.room_number || 'Not assigned'
      }));
    } catch (error) {
      console.error("Error updating preferred room:", error);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this psychologist's data?");
    if (confirmed) {
      try {
        const token = sessionStorage.getItem('accessToken');
        await Axios.delete(`http://localhost:5000/admin/psychologists/${psychologist.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onDelete(psychologist.id);
      } catch (error) {
        console.error("Error deleting psychologist:", error);
      }
    }
  };

  const handleEditHours = () => {
    if (isEditingHours) {
      saveWorkingHours();
    } else {
      setIsEditingHours(true);
    }
  };

  const handleCancelEditHours = () => {
    setIsEditingHours(false);
    setEditedHours({...workingHours});
  };

  const saveWorkingHours = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const hoursToSave = Object.keys(editedHours).map(day => ({
        day_of_week: daysOfWeek.indexOf(day) + 1,
        start_time: editedHours[day].start,
        end_time: editedHours[day].end
      })).filter(hour => hour.start_time && hour.end_time);

      await Axios.post(`http://localhost:5000/admin/psychologists/${psychologist.id}/hours`, { hours: hoursToSave }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkingHours(editedHours);
      setIsEditingHours(false);
    } catch (error) {
      console.error("Error saving working hours:", error);
    }
  };

  const handleHourChange = (day, type, value) => {
    setEditedHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
  };

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditedValue(value);
  };

  const handleSaveField = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await Axios.patch(`http://localhost:5000/admin/psychologists/${psychologist.id}`, {
        [editingField]: editedValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPsychologist(prev => ({ ...prev, [editingField]: editedValue }));
      setEditingField(null);
      setEditedValue('');
    } catch (error) {
      console.error("Error saving psychologist detail:", error);
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
            {psychologist[field]}
            <button className="edit-button" onClick={() => handleEditField(field, psychologist[field])}>Edit</button>
          </span>
        )}
      </p>
    );
  };

  return (
    <div className="psychologist-container">
      <div className="psychologist-header" onClick={toggleExpand}>
        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>&#9654;</span>
        <span>{psychologist.first_name} {psychologist.last_name}</span>
      </div>
      {isExpanded && (
        <div className="psychologist-details">
          {renderEditableField('first_name', 'First Name')}
          {renderEditableField('last_name', 'Last Name')}
          {renderEditableField('email', 'Email')}
          {renderEditableField('phone_number', 'Phone Number')}
          {renderEditableField('specialization', 'Specialization')}
          <p>
            <strong>Preferred Room:</strong>
            <select 
              value={psychologist.preferred_room_id || ''}
              onChange={handlePreferredRoomChange}
            >
              <option value="">Not assigned</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.room_number}
                </option>
              ))}
            </select>
          </p>
          <h3>Working Hours:</h3>
          <ul className="working-hours-list">
            {daysOfWeek.map(day => (
              <li key={day}>
                <div className="working-hours-row">
                  <span className="day-name">{day}:</span>
                  {isEditingHours ? (
                    <span className="time-inputs">
                      <input 
                        type="time" 
                        value={editedHours[day]?.start || ''}
                        onChange={(e) => handleHourChange(day, 'start', e.target.value)}
                      />
                      <input 
                        type="time" 
                        value={editedHours[day]?.end || ''}
                        onChange={(e) => handleHourChange(day, 'end', e.target.value)}
                      />
                    </span>
                  ) : (
                    <span className="time-display">
                      {workingHours[day] 
                        ? `${workingHours[day].start} - ${workingHours[day].end}` 
                        : 'Not set'}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="button-container">
            <button className="edit-hours-button" onClick={handleEditHours}>
              {isEditingHours ? 'Save Hours' : 'Edit Hours'}
            </button>
            {isEditingHours && (
              <button className="cancel-edit-button" onClick={handleCancelEditHours}>
                Cancel
              </button>
            )}
            <button className="delete-button" onClick={handleDelete}>Delete Psychologist</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Psychologist;