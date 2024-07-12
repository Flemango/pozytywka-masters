import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home  from './pages/Home';
import NoPage  from './pages/NoPage';
import Reservation from './pages/Reservation';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';


function App() {

  const [backendData, setBackendData] = useState({ users: [] }); // Initialize as an object with an empty "users" array

  useEffect(() => {
    fetch("/users")
      .then((response) => response.json())
      .then((data) => setBackendData(data))
      .catch((error) => console.error('Error fetching data:', error)); // Add error handling
  }, []); 

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NoPage/>} />
          <Route index element={<Home/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/reservation" element={<Reservation/>} />
          <Route path="/admin" element={<AdminLogin/>} />
          <Route path="/panel" element={<AdminLogin/>} />
        </Routes>
      </BrowserRouter>

      {(
        backendData.users.map((user, index) => (
          <React.Fragment key={user}>
            {user}
            {index !== backendData.users.length - 1 && <br/>}
          </React.Fragment>
        ))
      )}
    </div>
  );


  // return (
    
  // );
}

export default App;
