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
  const { language } = useContext(LanguageContext);

  const translations = {
    EN: {
      register: 'Register',
      email: 'E-mail:',
      first_name: 'First Name:',
      last_name: 'Last Name:',
      email: 'E-mail:',
      password: 'Password:',
      repeat: 'Confirm Password:',
      phone_number: 'Phone number:',
    },
    PL: {
      register: 'Zarejestruj',
      email: 'E-mail:',
      first_name: 'Imię:',
      last_name: 'Nazwisko:',
      password: 'Hasło:',
      repeat: 'Powtórz hasło:',
      phone_number: 'Numer telefonu:',
    }
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();

    // if (password !== confirmPassword) {
    //   setMessage('Passwords do not match.');
    //   return;
    // }

    // try {
    //   const response = await Axios.post('http://localhost:5000/register', {
    //     email,
    //     firstName,
    //     lastName,
    //     password,
    //   });

    //   if (response.status === 200) {
    //     setMessage('Registration successful. Please log in.');
    //   }
    // } catch (error) {
    //   setMessage('Registration failed. Please try again.');
    // }
    navigate('/login');
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
              type="number"
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
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
        {translations[language].repeat}
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button type="submit">{translations[language].register}</button>
      </form>
      <p className="register-message">{message}</p>
    </div>
  );
}
