import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Axios from 'axios';

export default function Home() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      Axios.post('http://localhost:5000/admin', {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
      })
      .then(response => { console.log(response.status)
        if (response.status===200) {
          // useEffect(() => {
          //   fetch("/users")
          //     .then((response) => response.json())
          //     .then((data) => setBackendData(data))
          //     .catch((error) => console.error('Error fetching data:', error)); // Add error handling
          // }, []); 
        }
          //navigate('/panel')
      })
      .catch(error => {
        if (error.response.status===401) setMessage("Invalid password.")
        else {
          setMessage("Unknown Error. Try again")
          console.error('Error:', error)
        }
      });

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
        Username:
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br/>
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
      <p>{message}</p>
    </div>
  );
}