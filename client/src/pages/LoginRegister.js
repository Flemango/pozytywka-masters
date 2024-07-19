import React from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import '../components/SubmitForms.css';

export default function LoginRegisterPage() {
  return (
    <div className="login-register-container">
      <Login />
      <Register />
    </div>
  );
}
