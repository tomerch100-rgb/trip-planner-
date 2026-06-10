import React, { useState } from 'react';
import API from '../services/api';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // קריאה לראוטר של ה-Backend שבנינו
      await API.post('/auth/register', formData);
      alert('נרשמת בהצלחה! עכשיו אפשר להתחבר');
      onSwitchToLogin(); // מעביר אותך אוטומטית למסך לוגין
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10" dir="rtl">
      <h2 className="text-2xl font-bold text-center mb-6">הרשמה למערכת</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">שם משתמש</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">אימייל</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">סיסמה</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition"
        >
          {loading ? 'נרשם...' : 'הרשם'}
        </button>

        <p className="text-center mt-4 text-sm">
          כבר יש לך משתמש?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 underline"
          >
            התחבר
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;