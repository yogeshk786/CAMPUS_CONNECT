import { useState } from 'react';
// Axios import path ko check karein, agar '../api/axios' kaam nahi kar raha toh 'axios' use karein
import axios from 'axios'; 
import { UserPlus, UserCheck, Check, Loader2 } from 'lucide-react';

/**
 * CompactConnectButton Component
 * * Ye button teen states handle karta hai:
 * 1. Connected: Agar user pehle se friend hai.
 * 2. Requested: Agar request bheji ja chuki hai.
 * 3. Connect: Nayi request bhejne ke liye.
 */
export default function CompactConnectButton({ targetUserId, isConnected, initialIsPending = false }) {
  // Local state sirf 'loading' animation dikhane ke liye hai
  const [loading, setLoading] = useState(false);

  // Custom API instance (Replace with your actual API path if needed)
  const API = axios.create({
    baseURL: '/api', 
    withCredentials: true
  });

  const handleConnect = async (e) => {
    e.stopPropagation(); 
    
    // Safety check: Agar pehle se connected/pending hai ya load ho raha hai toh return
    if (isConnected || initialIsPending || loading) return;

    setLoading(true); 
    
    try {
      // Backend ko connection request bhejein
      await API.post(`/users/connect/${targetUserId}`);
      
      /**
       * Sabse important step:
       * Ye event poore App ko batata hai ki profile data change ho gaya hai.
       * Isse App.jsx background refresh karega aur button ka status 'Requested' ho jayega.
       */
      window.dispatchEvent(new Event('profileUpdated'));
      
    } catch (err) {
      console.error("Connect error:", err);
      // Agar error aaye toh loading band kar dein
    } finally {
      setLoading(false);
    }
  };

  // Status derive karein: Priority order -> Connected > Loading > Pending > None
  let displayStatus = 'none';
  if (isConnected) {
    displayStatus = 'connected';
  } else if (loading) {
    displayStatus = 'loading';
  } else if (initialIsPending) {
    displayStatus = 'pending';
  }

  // UI styling based on current status
  let buttonStyle = "";
  let buttonContent = null;

  switch (displayStatus) {
    case 'connected':
      buttonStyle = "bg-green-500/10 border border-green-500/30 text-green-500 cursor-default";
      buttonContent = (
        <>
          <UserCheck size={16} />
          <span className="font-bold">Connected</span>
        </>
      );
      break;
    case 'pending':
      buttonStyle = "bg-[#00ba7c]/10 border border-[#00ba7c] text-[#00ba7c] cursor-default";
      buttonContent = (
        <>
          <Check size={16} strokeWidth={3} />
          <span className="font-bold">Requested</span>
        </>
      );
      break;
    case 'loading':
      buttonStyle = "bg-gray-200 text-black opacity-80 cursor-wait";
      buttonContent = (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="font-bold">Sending...</span>
        </>
      );
      break;
    case 'none':
    default:
      buttonStyle = "bg-white text-black hover:bg-gray-200 active:scale-95 shadow-lg shadow-white/5";
      buttonContent = (
        <>
          <UserPlus size={16} />
          <span className="font-bold">Connect</span>
        </>
      );
      break;
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={displayStatus !== 'none'}
      className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] transition-all duration-300 ease-in-out min-w-[110px] cursor-pointer ${buttonStyle}`}
    >
      <div className="flex items-center gap-1.5 transition-opacity duration-300">
        {buttonContent}
      </div>
    </button>
  );
}