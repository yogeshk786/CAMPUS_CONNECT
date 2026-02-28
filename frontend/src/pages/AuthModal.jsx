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
    name: '', handle: '', email: '', password: ''
  });

  // Jab bhi modal khule, check karo ki Login dikhana hai ya Register
  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
    setFormData({ name: '', handle: '', email: '', password: '' });
  }, [initialMode, isOpen]);

  if (!isOpen) return null; // Agar modal band hai toh kuch render mat karo

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
        // 👉 LOGIN API CALL
        response = await API.post('/users/login', { // Apna login route check kar lena
          email: formData.email.trim(),
          password: formData.password.trim()
        });
      } else {
        // 👉 REGISTER API CALL
        response = await API.post('/users/register', { // Apna register route check kar lena
          name: formData.name.trim(),
          handle: formData.handle.trim().replace('@', ''),
          email: formData.email.trim(),
          password: formData.password.trim(),
          role: 'student'
        });
      }

      // Success hone par data save karo aur Feed par bhejo
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      if (onAuthSuccess) onAuthSuccess();
      onClose(); // Modal band karo
      navigate('/feed'); // VIP Club mein entry!
      
    } catch (err) {
      console.error("Auth Error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#15202b] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer">
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <GraduationCap size={40} className="text-[#1d9bf0] mb-4" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Sign in to CampusConnect' : 'Create your account'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <input
                  type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3.5 focus:border-[#1d9bf0] outline-none transition text-white"
                />
                <input
                  type="text" name="handle" placeholder="username" required value={formData.handle} onChange={handleChange}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3.5 focus:border-[#1d9bf0] outline-none transition text-white"
                />
              </>
            )}

            <input
              type="email" name="email" placeholder="College Email" required value={formData.email} onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-xl p-3.5 focus:border-[#1d9bf0] outline-none transition text-white"
            />
            <input
              type="password" name="password" placeholder="Password" required minLength={6} value={formData.password} onChange={handleChange}
              className="w-full bg-black border border-gray-800 rounded-xl p-3.5 focus:border-[#1d9bf0] outline-none transition text-white"
            />

            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-black font-bold py-3.5 rounded-full hover:bg-gray-200 transition active:scale-95 flex justify-center items-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[#1d9bf0] hover:underline font-bold cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}