import { useState } from 'react';
import AuthModal from '../components/AuthModal';

// 👉 NOTE: App.jsx se 'onAuthSuccess' prop aayega yahan
export default function Landing({ onAuthSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' ya 'register'

  const openModal = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row relative">
      
      {/* Left Side */}
      <div className="lg:flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-[#1d9bf0]/5 to-transparent lg:border-r border-gray-800">
        <img 
          src="/logo.png" 
          alt="CampusConnect Logo" 
          className="w-48 h-48 lg:w-[450px] lg:h-[450px] object-contain animate-in zoom-in duration-700 drop-shadow-[0_0_50px_rgba(29,155,240,0.3)]" 
        />
      </div>

      {/* Right Side */}
      <div className="lg:flex-[0.8] flex flex-col justify-center p-8 lg:p-16 animate-in fade-in slide-in-from-right-8 duration-700">
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-12">
          Campus life,<br /> happening now.
        </h1>
        
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8">Join CampusConnect today.</h2>
          
          <div className="space-y-4">
            {/* 👉 THE FIX: Ab yeh navigate nahi karega, balki Modal kholega */}
            <button 
              onClick={() => openModal('register')}
              className="w-full bg-[#1d9bf0] text-white font-bold py-3.5 rounded-full text-lg hover:bg-[#1a8cd8] transition active:scale-95 shadow-lg shadow-[#1d9bf0]/20 cursor-pointer"
            >
              Create account
            </button>
            
            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-gray-800 flex-1"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="h-px bg-gray-800 flex-1"></div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-[17px] mb-4">Already have an account?</h3>
              <button 
                onClick={() => openModal('login')}
                className="w-full bg-transparent border border-gray-700 text-[#1d9bf0] font-bold py-3.5 rounded-full text-lg hover:bg-[#1d9bf0]/10 transition active:scale-95 cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 👉 THE FIX: Humara chamakta hua Auth Modal */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialMode={authMode}
        onAuthSuccess={onAuthSuccess} 
      />
    </div>
  );
}