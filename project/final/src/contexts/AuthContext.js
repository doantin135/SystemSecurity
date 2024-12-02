import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8888/api/auth/profile', {
        headers: { Authorization: token }
      })
      .then(response => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8888/api/auth/login', {
        email,
        password
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const userResponse = await axios.get('http://localhost:8888/api/auth/profile', {
        headers: { Authorization: token }
      });
      setUser(userResponse.data.user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await axios.post('http://localhost:8888/api/auth/register', {
        email,
        password,
        name
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const userResponse = await axios.get('http://localhost:8888/api/auth/profile', {
        headers: { Authorization: token }
      });
      setUser(userResponse.data.user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await axios.post('http://localhost:8888/api/auth/google-login', {
        idToken
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const userResponse = await axios.get('http://localhost:8888/api/auth/profile', {
        headers: { Authorization: token }
      });
      setUser(userResponse.data.user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8888/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};