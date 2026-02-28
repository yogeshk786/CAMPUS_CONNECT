import { useState, useEffect } from 'react';
import { X, GraduationCap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function AuthModal({ isOpen, onClose, initialMode, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    email: '',
    password: ''
  });

  // Modal khulte hi state aur error ko reset karein
  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
    setFormData({ name: '', handle: '', email: '', password: '' });
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        // 👉 FINAL FIX: Aapke server.js mein routes '/api/auth' par mapped hain
        response = await API.post('/auth/login', { 
          email: formData.email.trim(),
          password: formData.password.trim()
        });
      } else {
        // 👉 FINAL FIX: Register ke liye bhi '/auth/register' rasta hai
        response = await API.post('/auth/register', { 
          name: formData.name.trim(),
          handle: formData.handle.trim().replace('@', ''),
          email: formData.email.trim(),
          password: formData.password.trim(),
          role: 'student'
        });
      }

      // 💾 User data ko localStorage mein save karein
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      
      // 🚀 Global state update karein aur VIP access (Feed) par bhejein
      if (onAuthSuccess) onAuthSuccess();
      onClose();
      navigate('/feed');
      
    } catch (err) {
      console.error("Auth Error Details:", err.response?.data);
      // Agar backend se message hai toh wo dikhao, warna generic error
      setError(err.response?.data?.message || "Connection failed. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#15202b] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer">
          <X size={22} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#1d9bf0]/10 p-3 rounded-full mb-4">
              <GraduationCap size={44} className="text-[#1d9bf0]" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Sign in now' : 'Create account'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <input
                  type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange}
                  className="w-full bg-black border border-gray-800 rounded-xl p-4 focus:border-[#1d9bf0] outline-none transition text-white text-lg"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <input
                    type="text" name="handle" placeholder="username" required value={formData.handle} onChange={handleChange}
                    className="w-full bg-black border border-gray-800 rounded-xl p-4 pl-10 focus:border-[#1d9bf0] outline-none transition text-white text-lg"
                  />
                </div>
              </>
            )}

            <input
              type="email" name="email" placeholder="College Email" required value={formData.email} onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-xl p-4 focus:border-[#1d9bf0] outline-none transition text-white text-lg"
            />
            <input
              type="password" name="password" placeholder="Password" required minLength={6} value={formData.password} onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-xl p-4 focus:border-[#1d9bf0] outline-none transition text-white text-lg"
            />

            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gray-200 transition active:scale-95 flex justify-center items-center gap-2 mt-4 cursor-pointer text-lg shadow-xl shadow-white/5"
            >
              {loading ? <><Loader2 className="animate-spin" size={20} /> Loading...</> : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-500 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[#1d9bf0] hover:underline font-bold cursor-pointer ml-1"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}