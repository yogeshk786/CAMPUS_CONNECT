import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Loader2 } from 'lucide-react';
import API from '../api/axios';

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Extra spaces hata rahe hain
    const cleanData = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    console.log("🚀 Bhej rahe hain:", cleanData);

    try {
      // 👉 THE FINAL FIX: Yahan endpoint '/auth/login' kar diya hai
      const { data } = await API.post('/auth/login', cleanData);
      console.log("📦 Backend se kya aaya:", data);
      // 1. LocalStorage mein data save karein
      localStorage.setItem('userInfo', JSON.stringify(data));

      // 2. App.jsx ko batao ki login ho gaya hai
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // 3. Feed par navigate karein
      navigate('/feed');
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <div className="bg-blue-500/10 p-4 rounded-full mb-4">
            <GraduationCap size={48} className="text-[#1d9bf0]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Sign in to CampusConnect</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-xl p-4 focus:border-[#1d9bf0] outline-none transition-colors text-lg"
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-xl p-4 focus:border-[#1d9bf0] outline-none transition-colors text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-full text-lg hover:bg-gray-200 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#1d9bf0] hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}