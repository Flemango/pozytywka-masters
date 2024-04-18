import React, { useEffect, useState } from 'react';
import Axios from 'axios';

export default function Home() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = Axios.post('http://localhost:5000/admin', {
        password: 'password'
      });
      console.log(response);
      /*await fetch('http://localhost:5000/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {"password": "password"}
      });*/
      
    //   const data = await response.json();
    
    //   if (data.success) {
    //     setMessage('Login successful');
    //   } else {
    //     setMessage('Invalid password');
    //   }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Password:
          <input
            type="password"
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