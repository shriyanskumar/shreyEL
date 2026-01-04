import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve token from localStorage on app mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set default Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { token: newToken, user: newUser } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      // Set default Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { token: newToken, user: newUser } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      // Set default Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
