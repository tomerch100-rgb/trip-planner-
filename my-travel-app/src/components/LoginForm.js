import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      // הנחה: ה-Endpoint בהתאם ל-auth_router.py
      const response = await API.post('/auth/login', formData);
      // שימוש בפונקציית ההתחברות מה-Context ששומרת ב-localStorage
      login(response.data.access_token);
      alert('התחברת בהצלחה!');
    } catch (err) {
      setError('שגיאה בהתחברות. אנא בדוק את שם המשתמש והסיסמה.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10" dir="rtl">
      <h2 className="text-2xl font-bold text-center mb-6">התחברות למערכת</h2>
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
            minLength={2} // תואם לסכמת Field(min_length=2)
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
            minLength={6} // תואם לסכמת Field(min_length=6)
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
        >
          {loading ? 'מתחבר...' : 'התחבר'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;