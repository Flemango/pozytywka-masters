// src/components/Profile.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import Axios from 'axios';

import '../components/SubmitForms.css';

function Profile() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  const translations = {
    EN: {
      yourProfile: 'Your Profile',
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      changePassword: 'Change Password',
      logout: 'Logout',
      deleteAccount: 'Delete Account',
      deleteAccountConfirm: 'Are you sure you want to delete your account? This action cannot be undone.',
      deleteAccountSuccess: 'Your account has been successfully deleted.',
      deleteAccountError: 'An error occurred while deleting your account. Please try again.',
    },
    PL: {
      yourProfile: 'Twój Profil',
      email: 'Email',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      changePassword: 'Zmień hasło',
      logout: 'Wyloguj się',
      deleteAccount: 'Usuń Konto',
      deleteAccountConfirm: 'Czy na pewno chcesz usunąć swoje konto? Tej akcji nie można cofnąć.',
      deleteAccountSuccess: 'Twoje konto zostało pomyślnie usunięte.',
      deleteAccountError: 'Wystąpił błąd podczas usuwania konta. Proszę spróbować ponownie.',
    },
  };

  useEffect(() => {
    const rememberToken = localStorage.getItem('userAccessToken');
    const sessionToken = sessionStorage.getItem('userAccessToken');

    if (!rememberToken && !sessionToken) {
      navigate('/login'); // Redirect to login if user is not authenticated
    } else {
      // Retrieve user data from localStorage or sessionStorage
      const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
      if (user) {
        setUserData({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userAccessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('userAccessToken');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(translations[language].deleteAccountConfirm);
    
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('userAccessToken') || sessionStorage.getItem('userAccessToken');
        
        const response = await Axios.delete('http://localhost:5000/delete-account', {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId: userData.id } // Send userId in the request body
        });

        if (response.status === 200) {
          alert(translations[language].deleteAccountSuccess);
          handleLogout();
          navigate('/login');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert(translations[language].deleteAccountError);
      }
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="profile-page-container">
      <h1>{translations[language].yourProfile}</h1>
      <div className="profile-panel">
        <label>{translations[language].email}
          <input type="text" id="email" value={userData.email} readOnly />
        </label>

        <div className="name-container">
          <label>{translations[language].firstName}
            <input type="text" id="firstName" value={userData.firstName} readOnly />
          </label>

          <label>{translations[language].lastName}
            <input type="text" id="lastName" value={userData.lastName} readOnly />
          </label>
        </div>

        <div className="button-container">
          <button className="change-password-button" style={{ marginRight: 16 + 'px' }} onClick={handleChangePassword}>
            {translations[language].changePassword}
          </button>
          <button className="logout-button" onClick={handleLogout}>
            {translations[language].logout}
          </button>
        </div>
        <button className="delete-account-button" onClick={handleDeleteAccount}>
          {translations[language].deleteAccount}
        </button>
      </div>
    </div>
  );
}

export default Profile;
