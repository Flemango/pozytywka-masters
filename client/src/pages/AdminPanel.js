import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [accessToken, setAccessToken] = useState(sessionStorage.getItem('accessToken'));

  useEffect(() => {
    let interval;

    const refreshAccessToken = async () => {
      try {
        const response = await Axios.post(
          'http://localhost:5000/refresh',
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setAccessToken(response.data.accessToken);
        sessionStorage.setItem('accessToken', response.data.accessToken);
      } catch (error) {
        setAccessToken('');
        sessionStorage.removeItem('accessToken');
        navigate('/');
      }
    };

    if (accessToken) {
      interval = setInterval(refreshAccessToken, 5000); // Refresh every 5 seconds
    }

    return () => clearInterval(interval);
  }, [accessToken, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get('http://localhost:5000/panel', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setMessage(response.data.message);
      } catch (error) {
        navigate('/');
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken, navigate]);

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>{message}</p>
    </div>
  );
};

export default AdminPanel;
