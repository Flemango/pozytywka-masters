// // src/App.js
// import React, { useEffect, useState } from 'react';
// import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
// import { LanguageProvider } from './context/LanguageContext';

// import './App.css';

// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute';

// import Home from './pages/Home';
// import NoPage from './pages/NoPage';
// import Reservation from './pages/Reservation';
// import AdminLogin from './pages/AdminLogin';
// import AdminPanel from './pages/AdminPanel';
// import Services from './pages/Services';
// import Contact from './pages/Contact';

// function App() {
//   const [backendData, setBackendData] = useState({ users: [] });
//   //const location = useLocation();
//   //const isAdminPanel = location.pathname === '/panel';

//   // useEffect(() => {
//   //   fetch("/users")
//   //     .then((response) => response.json())
//   //     .then((data) => setBackendData(data))
//   //     .catch((error) => console.error('Error fetching data:', error));
//   // }, []);

//   return (
//     <>
//       <LanguageProvider>
//         <BrowserRouter>
//           <Navbar />
//             <div className="content" id="content">
//               <Routes>
//                 <Route path="*" element={<NoPage />} />
//                 <Route index element={<Home />} />
//                 <Route path="/" element={<Home />} />
//                 <Route path="/home" element={<Home />} />
//                 <Route path="/reservation" element={<Reservation />} />
//                 <Route path="/services" element={<Services />} />
//                 <Route path="/contact" element={<Contact />} />

//                 <Route path="/admin" element={<AdminLogin />} />
//                 <Route path="/panel" element={<ProtectedRoute element={AdminPanel} />} />
//               </Routes>
//             </div>
//           <Footer />
//         </BrowserRouter>
//       </LanguageProvider>
//     </>
//   );
// }

// export default App;

// /*{backendData.users.map((user, index) => (
//           <React.Fragment key={index}>
//             {user}
//             {index !== backendData.users.length - 1 && <br />}
//           </React.Fragment>
//         ))}*/

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

import MainContent from './components/MainContent';
import ProtectedRoute from './components/ProtectedRoute';

import AdminPanel from './pages/AdminPanel';

function App() {
  const [backendData, setBackendData] = useState({ users: [] });

  useEffect(() => {
    fetch("/users")
      .then((response) => response.json())
      .then((data) => setBackendData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/panel" element={<ProtectedRoute element={AdminPanel} />} />
            <Route path="*" element={<MainContent />} />
          </Routes>
        </BrowserRouter>
        {backendData.users.map((user, index) => (
          <React.Fragment key={index}>
            {user}
            {index !== backendData.users.length - 1 && <br />}
          </React.Fragment>
        ))}
      </LanguageProvider>
    </>
  );
}

export default App;
