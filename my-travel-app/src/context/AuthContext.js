import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // בדיקה אוטומטית בעת טעינת האתר אם המשתמש כבר מחובר (יש טוקן בזיכרון)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // פיענוח ה-JWT Payload בצד הלקוח כדי לחלץ את ה-user_id
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setUser({ user_id: payload.sub || payload.user_id });
      } catch (e) {
        // אם הטוקן פגום או לא תקין, ננקה אותו
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // פונקציית התחברות - שולחת את ה-UserLogin Pydantic Model שלך כ-JSON
  const login = async (username, password) => {
    const response = await axios.post('http://localhost:8000/auth/login', {
      username,
      password
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    // פיענוח ה-user_id מתוך הטוקן החדש שנוצר
    const base64Url = access_token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    setUser({ user_id: payload.sub || payload.user_id });
    return response.data;
  };

  // פונקציית הרשמה - שולחת את ה-UserCreate Pydantic Model שלך
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