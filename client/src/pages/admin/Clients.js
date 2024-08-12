import { useState, useEffect } from 'react';
import Axios from 'axios';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const response = await Axios.get('http://localhost:5000/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        setClients(data);

        //console.log('Response status:', response.status);
        //console.log('Received data:', data);

      } catch (error) {
        console.error('Error in fetchClients:', error);
        setError(error.message || 'An error occurred while fetching clients.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Client List</h1>
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            {client.first_name} {client.last_name} - {client.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clients;
