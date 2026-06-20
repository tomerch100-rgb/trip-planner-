import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Compass, Lock, User, Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-cyan-100">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome to Triper</h1>
          <p className="text-sm text-slate-400 font-medium">Log in to start planning your luxury custom escape</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 flex items-start gap-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                placeholder="Enter your username"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-cyan-100 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Your Workspace"}
          </button>
        </form>

        {/* Footer Switch */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Don't have an account?{" "}
            <button 
              onClick={onSwitchToRegister}
              type="button" 
              className="text-cyan-600 font-bold hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}