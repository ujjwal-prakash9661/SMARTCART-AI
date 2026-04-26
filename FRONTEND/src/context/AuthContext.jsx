import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { auth as firebaseAuth } from '../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        localStorage.setItem('token', token);
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    // Apply theme colors globally when user context changes
    const colors = user?.settings?.themeColors || {};
    const defaultColor = '#00FFCC';
    document.documentElement.style.setProperty('--theme-accent', colors.navbar || defaultColor);
    document.body.style.setProperty('--theme-accent', colors.navbar || defaultColor);
    document.documentElement.style.setProperty('--theme-store', colors.store || defaultColor);
    document.documentElement.style.setProperty('--theme-cart', colors.cart || defaultColor);
    document.documentElement.style.setProperty('--theme-orders', colors.orders || defaultColor);
    document.documentElement.style.setProperty('--theme-profile', colors.profile || defaultColor);
    document.documentElement.style.setProperty('--theme-admin', colors.admin || defaultColor);
  }, [user?.settings?.themeColors]);


  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const updateUser = async (data) => {
    try {
      const response = await axios.put('/api/auth/update', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, register, logout, loading, setToken, setUser, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
