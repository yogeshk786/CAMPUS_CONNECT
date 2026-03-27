import { useState } from 'react';
import AuthModal from './AuthModal';
import { GoogleLogin } from '@react-oauth/google'; 
import axios from 'axios';

export default function Landing({ onAuthSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openModal = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        idToken: credentialResponse.credential
      }, { withCredentials: true });

      if (res.status === 200) onAuthSuccess(res.data);
    } catch (error) {
      console.error("Google Login Failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row relative">
      
      {/* Left Side - Logo */}
      <div className="lg:flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-[#1d9bf0]/5 to-transparent lg:border-r border-gray-800">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-48 h-48 lg:w-[450px] lg:h-[450px] object-contain" 
        />
      </div>

      {/* Right Side - Auth Options */}
      <div className="lg:flex-[0.8] flex flex-col justify-center p-8 lg:p-16">
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-12 leading-tight">
          Campus life,<br /> happening now.
        </h1>
        
        <div className="max-w-[350px] w-full"> {/* Container width matched to Google Button default */}
          <h2 className="text-3xl text-center font-bold mb-8">Join CampusConnect, today.</h2>
          
          <div className="space-y-4">
            {/* 👉 Google Button: Set to 'pill' and 'large' */}
            <div className="w-full flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log('Login Failed')}
                    theme="filled_blue"
                    shape="pill"
                    size="large"
                    width="350" // Matching width
                    text="continue_with"
                />
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-gray-800 flex-1"></div>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">or</span>
              <div className="h-px bg-gray-800 flex-1"></div>
            </div>

            {/* 👉 Create Account: Now looks like the Google Button */}
            <button 
              onClick={() => openModal('register')}
              className="w-full bg-[#1d9bf0] text-white font-bold h-[40px] rounded-full text-sm hover:bg-[#1a8cd8] transition active:scale-95 flex items-center justify-center cursor-pointer"
            >
              Create account
            </button>
            
            <p className="text-[11px] text-gray-500 px-2 leading-tight mt-2">
                By signing up, you agree to the Terms of Service and Privacy Policy.
            </p>

            <div className="pt-12 space-y-4">
              <h3 className="font-bold text-[17px] mb-2">Already have an account?</h3>
              {/* 👉 Sign In: Smaller button as requested */}
              <button 
                onClick={() => openModal('login')}
                className="w-full max-w-[350px] bg-transparent border border-gray-700 text-[#1d9bf0] font-bold py-2 rounded-full text-sm hover:bg-[#1d9bf0]/10 transition active:scale-95 cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialMode={authMode}
        onAuthSuccess={onAuthSuccess} 
      />
    </div>
  );
}