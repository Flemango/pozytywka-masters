import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';
import '../components/SubmitForms.css';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { language } = useContext(LanguageContext);

  const translations = {
    EN: {
      register: 'Register',
      email: 'E-mail:',
      first_name: 'First Name:',
      last_name: 'Last Name:',
      password: 'Password:',
      repeat: 'Confirm Password:',
      phone_number: 'Phone number:',
      passwordLength: 'At least 8 characters long',
      uppercaseLetter: 'Contains at least one uppercase letter',
      number: 'Contains at least one number',
      passwordsMatchError: 'Passwords do not match.',
      emptyFieldsError: 'All fields are required.',
      successMessage: 'Registration successful. Please log in.',
      failedMessage: 'Registration failed. Please try again.',
      userExistsError: 'E-mail is already in use.'
    },
    PL: {
      register: 'Zarejestruj',
      email: 'E-mail:',
      first_name: 'Imię:',
      last_name: 'Nazwisko:',
      password: 'Hasło:',
      repeat: 'Powtórz hasło:',
      phone_number: 'Numer telefonu:',
      passwordLength: 'Co najmniej 8 znaków',
      uppercaseLetter: 'Zawiera co najmniej jedną wielką literę',
      number: 'Zawiera co najmniej jedną cyfrę',
      passwordsMatchError: 'Hasła się nie zgadzają.',
      emptyFieldsError: 'Wszystkie pola są wymagane.',
      successMessage: 'Rejestracja udana. Proszę się zalogować.',
      failedMessage: 'Rejestracja nie powiodła się. Spróbuj ponownie.',
      userExistsError: 'Użytkownik z tym adresem email już istnieje.',
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !firstName || !lastName || !password || !confirmPassword || !phoneNumber) {
      setMessage(translations[language].emptyFieldsError);
      return;
    }
  
    if (password !== confirmPassword) {
      setMessage(translations[language].passwordsMatchError);
      return;
    }
  
    if (Object.keys(errors).length > 0) {
      // If there are password validation errors, show the first error
      setMessage(Object.values(errors)[0]);
      return;
    }
  
    try {
      const response = await Axios.post('http://localhost:5000/register', {
        email,
        firstName,
        lastName,
        password,
        phoneNumber
      });
  
      if (response.status === 201) {
        setMessage(translations[language].successMessage);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage(() => translations[language].userExistsError);
      } else {
        setMessage(() => translations[language].failedMessage);
      }
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="register-container">
      <h2>{translations[language].register}</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="name-container">
          <label>
            {translations[language].email}
            <input
              type="email"
              value={email}
              placeholder="user@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            {translations[language].phone_number}
            <input
              type="tel"
              value={phoneNumber}
              placeholder="000-000-000"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </label>
        </div>
        <div className="name-container">
          <label>
            {translations[language].first_name}
            <input
              type="text"
              value={firstName}
              placeholder="Jan"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label>
            {translations[language].last_name}
            <input
              type="text"
              value={lastName}
              placeholder="Kowalski"
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
        </div>
        <label>
          {translations[language].password}
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={errors.length || errors.upperCase || errors.number ? 'invalid' : 'valid'}
          />
          <div className="center-div">
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
        </label>
        <label>
          {translations[language].repeat}
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={confirmPassword && password !== confirmPassword ? 'invalid' : 'valid'}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="error">{translations[language].passwordsMatchError}</p>
          )}
        </label>
        <button type="submit">{translations[language].register}</button>
      </form>
      <p className="register-message">{message}</p>
    </div>
  );
}