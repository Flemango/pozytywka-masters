import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

const ProtectedRoute = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const response = await Axios.get('http://localhost:5000/panel', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component /> : null;
};

export default ProtectedRoute;
