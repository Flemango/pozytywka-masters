import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Room from '../../components/admin/Room';
import RoomCreator from '../../components/admin/RoomCreator';
import './Clients.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const results = rooms.filter(room =>
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRooms(results);
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await Axios.get('http://localhost:5000/admin/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedRooms = response.data.sort((a, b) => {
        return parseInt(a.room_number) - parseInt(b.room_number);
      });
      setRooms(sortedRooms);
      setFilteredRooms(sortedRooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms');
      setIsLoading(false);
    }
  };

  const handleAddRoom = () => {
    setIsAddingRoom(true);
  };

  const handleCancelAdd = () => {
    setIsAddingRoom(false);
  };

  const handleCreateRoom = async (newRoom) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await Axios.post('http://localhost:5000/admin/rooms', newRoom, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms();
      setIsAddingRoom(false);
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await Axios.delete(`http://localhost:5000/admin/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(prevRooms => 
        prevRooms
          .filter(room => room.id !== roomId)
          .sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number))
      );
      setFilteredRooms(prevRooms => 
        prevRooms
          .filter(room => room.id !== roomId)
          .sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number))
      );
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('Failed to delete room');
    }
  };

  const handleUpdateRoom = (roomId, updatedData) => {
    const updateAndSort = (prevRooms) => {
      const updatedRooms = prevRooms.map(room => 
        room.id === roomId ? { ...room, ...updatedData } : room
      );
      return updatedRooms.sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number));
    };

    setRooms(updateAndSort);
    setFilteredRooms(updateAndSort);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="rooms-page">
      <div className="header-container">
        {!isAddingRoom && (
            <> 
              <h1>Rooms</h1>
              <div className="search-add-container">
                <input
                  type="text"
                  placeholder="Search by room number"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button onClick={handleAddRoom} className="add-room-btn">+</button> 
              </div>
            </>
        )}
      </div>
      {isAddingRoom ? (
        <RoomCreator onCancel={handleCancelAdd} onCreate={handleCreateRoom} />
      ) : (
        <div className="rooms-list">
          {filteredRooms.map(room => (
            <Room 
              key={room.id} 
              room={room} 
              onDelete={handleDeleteRoom}
              onUpdate={handleUpdateRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;