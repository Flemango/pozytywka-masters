import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import Axios from 'axios';
import '../components/SubmitForms.css';

function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const translations = {
    EN: {
      changePassword: 'Change Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      passwordLength: 'At least 8 characters long',
      uppercaseLetter: 'Contains at least one uppercase letter',
      number: 'Contains at least one number',
      passwordsMatchError: 'Passwords do not match.',
      emptyFieldsError: 'Password fields cannot be empty.',
      successMessage: 'Password changed successfully.',
    },
    PL: {
      changePassword: 'Zmień Hasło',
      newPassword: 'Nowe Hasło',
      confirmPassword: 'Potwierdź Nowe Hasło',
      passwordLength: 'Co najmniej 8 znaków',
      uppercaseLetter: 'Zawiera co najmniej jedną wielką literę',
      number: 'Zawiera co najmniej jedną cyfrę',
      passwordsMatchError: 'Hasła się nie zgadzają.',
      emptyFieldsError: 'Pola hasła nie mogą być puste.',
      successMessage: 'Hasło zostało zmienione pomyślnie.',
    },
  };

  useEffect(() => {
    const token = localStorage.getItem('userAccessToken') || sessionStorage.getItem('userAccessToken');

    if (!token) {
      navigate('/login'); // Redirect to login if user is not authenticated
    }
  }, [navigate]);

  const validatePassword = (password) => {
    const errors = {};
    const regexUpperCase = /[A-Z]/;
    const regexNumber = /[0-9]/;

    if (password.length < 8) {
      errors.length = translations[language].passwordLength;
    }
    if (!regexUpperCase.test(password)) {
      errors.upperCase = translations[language].uppercaseLetter;
    }
    if (!regexNumber.test(password)) {
      errors.number = translations[language].number;
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrors(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password && !confirmPassword) {
      setErrors({ emptyFields: translations[language].emptyFieldsError });
      return;
    }

    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: translations[language].passwordsMatchError,
      }));
      return;
    }

    if (Object.keys(errors).length === 0) {
      try {
        const token = sessionStorage.getItem('userAccessToken') || localStorage.getItem('userAccessToken');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await Axios.post(
          'http://localhost:5000/change-password',
          { newPassword: password },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          window.alert(translations[language].successMessage);
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        setErrors({ server: 'An error occurred while changing the password. Please try again.' });
      }
    }
  };

  return (
    <div className="profile-page-container">
      <h2>{translations[language].changePassword}</h2>
      <form onSubmit={handleSubmit} className="profile-panel">
        <div className="form-group">
          <label htmlFor="password">{translations[language].newPassword}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className={errors.length || errors.upperCase || errors.number ? 'invalid' : 'valid'}
          />
          <div className="password-requirements">
            <p className={password.length >= 8 ? 'met' : 'unmet'}>
              {translations[language].passwordLength}
            </p>
            <p className={/[A-Z]/.test(password) ? 'met' : 'unmet'}>
              {translations[language].uppercaseLetter}
            </p>
            <p className={/[0-9]/.test(password) ? 'met' : 'unmet'}>
              {translations[language].number}
            </p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">{translations[language].confirmPassword}</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={confirmPassword && password !== confirmPassword ? 'invalid' : 'valid'}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="error">{translations[language].passwordsMatchError}</p>
          )}
        </div>
        {errors.emptyFields && (
          <p className="error">{errors.emptyFields}</p>
        )}
        <button type="submit" className="submit-button">{translations[language].changePassword}</button>
      </form>
    </div>
  );
}

export default ChangePassword;
