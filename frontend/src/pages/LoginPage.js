import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    setLoading(false);

    if (result.success) {
      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Document Tracker</h1>
          <p>{isLogin ? 'Welcome Back' : 'Create Account'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button 
              type="button"
              onClick={toggleMode}
              className="auth-toggle-btn"
              disabled={loading}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      <div className="auth-background"></div>
    </div>
  );
};

export default LoginPage;
