// import React, { useEffect, useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import Axios from 'axios';
// import '../components/ReservationPanel.css';

// export default function Home() {
//   const navigate = useNavigate()

//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
  
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       Axios.post('http://localhost:5000/admin', {
//         username: document.getElementById("username").value,
//         password: document.getElementById("password").value
//       })
//       .then(response => { console.log(response.status)
//         if (response.status===200) {
//           // useEffect(() => {
//           //   fetch("/users")
//           //     .then((response) => response.json())
//           //     .then((data) => setBackendData(data))
//           //     .catch((error) => console.error('Error fetching data:', error)); // Add error handling
//           // }, []); 
//         }
//           //navigate('/panel')
//       })
//       .catch(error => {
//         if (error.response.status===401) setMessage("Invalid password.")
//         else {
//           setMessage("Unknown Error. Try again")
//           console.error('Error:', error)
//         }
//       });

//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   return (
//     <div className="login-container">
//       <form className="login-form" onSubmit={handleSubmit}>
//         <label>
//         Username:
//           <input
//             type="username"
//             id="username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           /><br/>
//           Password:
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </label>
//         <button type="submit">Login</button>
//       </form>
//       <p className="login-message">{message}</p>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import '../components/ReservationPanel.css';

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('http://localhost:5000/admin', {
        username: username,
        password: password
      });

      if (response.status === 200) {
        setAccessToken(response.data.accessToken);
        navigate('/panel');
      }
    } catch (error) {
      if (error.response.status === 401) setMessage('Invalid password.');
      else {
        setMessage('Unknown Error. Try again');
        console.error('Error:', error);
      }
    }
  };

  useEffect(() => {
    let interval;

    if (accessToken) {
      interval = setInterval(async () => {
        try {
          const response = await Axios.post(
            'http://localhost:5000/refresh',
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          setAccessToken(response.data.accessToken);
        } catch (error) {
          setAccessToken('');
          navigate('/');
        }
      }, 5000); // Refresh every 5 seconds
    }

    return () => clearInterval(interval);
  }, [accessToken, navigate]);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
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
