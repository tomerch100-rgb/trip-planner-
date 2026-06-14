import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // בדיקה אוטומטית בעת טעינת האתר אם המשתמש כבר מחובר (יש טוקן בזיכרון)
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // שולחים את הטוקן לשרת לבדיקה
        // אנחנו צריכים נתיב כזה ב-Backend, או להשתמש בנתיב קיים שדורש זיהוי
        const response = await axios.get('http://localhost:8000/trips/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // אם הצלחנו לקבל רשימת טיולים, סימן שהטוקן תקין!
        // נעדכן את ה-user ב-Context
        setUser({ authenticated: true }); 
      } catch (e) {
        // אם השרת החזיר 401, סימן שהטוקן לא תקין
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
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