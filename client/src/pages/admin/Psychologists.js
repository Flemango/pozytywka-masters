import { useState, useEffect } from 'react';
import Axios from 'axios';
import Psychologist from '../../components/admin/Psychologist';
import PsychologistCreator from '../../components/admin/PsychologistCreator';
import './Clients.css';

const Psychologists = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPsychologist, setIsAddingPsychologist] = useState(false);

  const fetchPsychologists = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await Axios.get('http://localhost:5000/admin/psychologists', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      setPsychologists(data);
      setFilteredPsychologists(data);

    } catch (error) {
      console.error('Error in fetchPsychologists:', error);
      setError(error.message || 'An error occurred while fetching psychologists.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPsychologists();
  }, []);

  useEffect(() => {
    const results = psychologists.filter(psychologist =>
      `${psychologist.first_name} ${psychologist.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredPsychologists(results);
  }, [searchTerm, psychologists]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = (psychologistId) => {
    setPsychologists(psychologists.filter(psychologist => psychologist.id !== psychologistId));
    setFilteredPsychologists(filteredPsychologists.filter(psychologist => psychologist.id !== psychologistId));
  };

  const handleAddPsychologist = () => {
    setIsAddingPsychologist(true);
  };

  const handleCancelAdd = () => {
    setIsAddingPsychologist(false);
  };

  const handleCreatePsychologist = async (newPsychologist) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await Axios.post('http://localhost:5000/admin/add-psychologist', newPsychologist, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        fetchPsychologists(); // Refresh the list of psychologists
        setIsAddingPsychologist(false);
      }
    } catch (error) {
      console.error('Error creating psychologist:', error);
      setError('Failed to create psychologist. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="header-container">
        {!isAddingPsychologist && (
          <>
            <h1>Psychologist List</h1>
            <div className="search-add-container">
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button onClick={handleAddPsychologist} className="add-psychologist-btn">+</button>
            </div>
          </>
        )}
      </div>
      {isAddingPsychologist ? (
        <PsychologistCreator onCancel={handleCancelAdd} onCreate={handleCreatePsychologist} />
      ) : (
        <div className="psychologists-list">
          {filteredPsychologists.map(psychologist => (
            <Psychologist key={psychologist.id} psychologist={psychologist} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Psychologists;