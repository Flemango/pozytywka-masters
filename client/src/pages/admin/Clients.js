import { useState, useEffect } from 'react';
import Axios from 'axios';
import Client from '../../components/admin/Client';
import './Clients.css'

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const response = await Axios.get('http://localhost:5000/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        setClients(data);
        setFilteredClients(data);

      } catch (error) {
        console.error('Error in fetchClients:', error);
        setError(error.message || 'An error occurred while fetching clients.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const results = clients.filter(client =>
      `${client.first_name} ${client.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = (clientId) => {
    setClients(clients.filter(client => client.id !== clientId));
    setFilteredClients(filteredClients.filter(client => client.id !== clientId));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="header-container">
        <h1>Client List</h1>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div className="clients-list">
        {filteredClients.map(client => (
          <Client key={client.id} client={client} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default Clients;