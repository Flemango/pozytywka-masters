import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home  from './pages/Home';
import NoPage  from './pages/NoPage';
import Reservation from './pages/Reservation';
import AdminPanel from './pages/AdminPanel';

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NoPage/>} />
          <Route index element={<Home/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/reservation" element={<Reservation/>} />
          <Route path="/adminpanel" element={<AdminPanel/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );


  // const [backendData, setBackendData] = useState({ users: [] }); // Initialize as an object with an empty "users" array

  // useEffect(() => {
  //   fetch("/api")
  //     .then((response) => response.json())
  //     .then((data) => setBackendData(data))
  //     .catch((error) => console.error('Error fetching data:', error)); // Add error handling
  // }, []);

  // return (
  //   <div>
  //     {(
  //       backendData.users.map((user, index) => (
  //         <React.Fragment key={user}>
  //           {user}
  //           {index !== backendData.users.length - 1 && <br/>}
  //         </React.Fragment>
  //       ))
  //     )}
  //   </div>
  // );
}

export default App;
