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
      register_btn: 'Register'
    },
    PL: {
      login: 'Zaloguj',
      email: 'E-mail:',
      password: 'Hasło:',
      remember_me: 'Zapamiętaj mnie',
      login_btn: 'Zaloguj',
      register_btn: 'Zarejestruj'
    }
  };


  const handleSubmit = async (e) => {
    // e.preventDefault();

    // try {
    //   const response = await Axios.post('http://localhost:5000/login', {
    //     email,
    //     password,
    //   });

    //   if (response.status === 200) {
    //     if (remember) {
    //       localStorage.setItem('accessToken', response.data.accessToken);
    //     }
    //     navigate('/panel');
    //   }
    // } catch (error) {
    //   setMessage('Login failed. Please check your credentials and try again.');
    // }
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
