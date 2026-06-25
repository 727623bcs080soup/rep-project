// src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthForm.css';

// Accept setNotification as a prop
const LoginPage = ({ setNotification }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setNotification({ message: 'Login successful!', type: 'success' }); 
      navigate('/');
    }
  }, [isAuthenticated, navigate, setNotification]);

  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // login returns true/false, but we don't need to assign it to a variable here anymore
    await login({ email, password }); 

    // Failure Notification
    if (!isAuthenticated) { 
        setNotification({ message: 'Wrong credentials. Please check your email and password.', type: 'error' });
    }
  };
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Log in</h2>
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required />
        <button type="submit">Log in</button>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};
export default LoginPage;