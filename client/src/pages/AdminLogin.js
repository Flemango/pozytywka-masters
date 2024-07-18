import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import '../components/ReservationPanel.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('http://localhost:5000/admin', {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('accessToken', response.data.accessToken);
        navigate('/panel');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Invalid password.');
      } else {
        setMessage('Unknown error. Try again.');
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          Password:
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <p className="login-message">{message}</p>
    </div>
  );
}
