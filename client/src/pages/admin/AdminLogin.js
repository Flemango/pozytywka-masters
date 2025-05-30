import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import '../../components/SubmitForms.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('http://localhost:5000/admin-login', {
        email,
        password,
      });

      if (response.status === 200) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
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
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
      <p className="admin-login-message">{message}</p>
    </div>
  );
}
