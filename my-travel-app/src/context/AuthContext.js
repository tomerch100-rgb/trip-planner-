import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatic check upon loading the site to see if the user is already logged in (token exists in memory)
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Send the token to the server for verification
        // We need an endpoint like this in the Backend, or use an existing endpoint that requires authentication
        const response = await axios.get('http://localhost:8000/trips/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If we successfully received the trips list, it means the token is valid!
        // We update the user state in the Context
        setUser({ authenticated: true }); 
      } catch (e) {
        // If the server returned 401, it means the token is invalid
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  // Login function - sends your UserLogin Pydantic Model as JSON
  const login = async (username, password) => {
    const response = await axios.post('http://localhost:8000/auth/login', {
      username,
      password
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    // Decoding the user_id from inside the newly created token
    const base64Url = access_token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    setUser({ user_id: payload.sub || payload.user_id });
    return response.data;
  };

  // Registration function - sends your UserCreate Pydantic Model
  const register = async (email, username, password) => {
    const response = await axios.post('http://localhost:8000/auth/register', {
      email,
      username,
      password
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};