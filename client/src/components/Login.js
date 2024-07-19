import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      if (response.status === 200) {
        if (remember) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        navigate('/panel');
      }
    } catch (error) {
      setMessage('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="login-container">
    <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="checkbox-container">
        <input
            type="checkbox"
            className="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
        />
        <label>Remember me</label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p className="login-message">{message}</p>
    </div>
  );
}
