// src/pages/Login.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import Axios from 'axios';
import '../components/SubmitForms.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const { language } = useContext(LanguageContext);

  const translations = {
    EN: {
      login: 'Login',
      email: 'E-mail:',
      password: 'Password:',
      remember_me: 'Remember me',
      login_btn: 'Login',
      register_btn: 'Register',
      login_failed: 'Login failed. Please check your credentials and try again.'
    },
    PL: {
      login: 'Zaloguj',
      email: 'E-mail:',
      password: 'Hasło:',
      remember_me: 'Zapamiętaj mnie',
      login_btn: 'Zaloguj',
      register_btn: 'Zarejestruj',
      login_failed: 'Logowanie nie powiodło się. Sprawdź swoje dane i spróbuj ponownie.'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post('http://localhost:5000/user-login', {
        email,
        password,
      });

      if (response.status === 200) {
        if (remember) {
          localStorage.setItem('userAccessToken', response.data.accessToken);
          //localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          sessionStorage.setItem('userAccessToken', response.data.accessToken);
          //sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }
        navigate('/home');
      }
    } catch (error) {
      setMessage(translations[language].login_failed);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>{translations[language].login}</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          {translations[language].email}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          {translations[language].password}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="checkbox-container">
          <input
            type="checkbox"
            className="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label>{translations[language].remember_me}</label>
        </div>
        <div className="button-container">
          <button type="submit" style={{marginRight: 16+'px'}}>{translations[language].login_btn}</button>
          <button type="button" onClick={handleRegister}>{translations[language].register_btn}</button>
        </div>
      </form>
      <p className="login-message">{message}</p>
    </div>
  );
}
