import { useState } from 'react';
import API from '../api/axios';
import { UserPlus, UserCheck, Check, Loader2 } from 'lucide-react';

export default function CompactConnectButton({ targetUserId, isConnected, initialIsPending = false }) {
  // 👉 Local state sirf humare 'loading' aur 'pending' animation ke liye hai
  const [localState, setLocalState] = useState('none'); 

  const handleConnect = async (e) => {
    e.stopPropagation(); 
    
    // Agar pehle se connected, pending, ya loading hai, toh ruk jao
    if (isConnected || initialIsPending || localState !== 'none') return;

    setLocalState('loading'); // Animation start
    
    try {
      await API.post(`/users/connect/${targetUserId}`);
      
      setTimeout(() => {
        setLocalState('pending'); // Success hone par green tick
      }, 300);
      
    } catch (err) {
      console.error("Connect error:", err);
      setLocalState('none'); // Fail hone par wapas normal button
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  // 👉 JADU YAHAN HAI: Hum bina useEffect ke direct final status nikal rahe hain
  let displayStatus = 'none';
  if (isConnected) {
    displayStatus = 'connected';
  } else if (localState === 'loading') {
    displayStatus = 'loading';
  } else if (initialIsPending || localState === 'pending') {
    displayStatus = 'pending';
  }

  // Ab displayStatus ke hisaab se UI set karein
  let buttonStyle = "";
  let buttonContent = null;

  switch (displayStatus) {
    case 'connected':
      buttonStyle = "bg-transparent border border-gray-600 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10";
      buttonContent = (
        <><UserCheck size={16} /><span className="font-bold">Connected</span></>
      );
      break;
    case 'pending':
      buttonStyle = "bg-[#00ba7c]/10 border border-[#00ba7c] text-[#00ba7c] cursor-default";
      buttonContent = (
        <><Check size={16} strokeWidth={3} /><span className="font-bold">Requested</span></>
      );
      break;
    case 'loading':
      buttonStyle = "bg-gray-200 text-black opacity-80 cursor-wait";
      buttonContent = (
        <><Loader2 size={16} className="animate-spin" /><span className="font-bold">Sending...</span></>
      );
      break;
    case 'none':
    default:
      buttonStyle = "bg-white text-black hover:bg-gray-200 active:scale-95";
      buttonContent = (
        <><UserPlus size={16} /><span className="font-bold">Connect</span></>
      );
      break;
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={displayStatus === 'loading' || displayStatus === 'pending'}
      className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[14px] transition-all duration-300 ease-in-out min-w-[110px] ${buttonStyle}`}
    >
      <div className="flex items-center gap-1.5 transition-opacity duration-300">
        {buttonContent}
      </div>
    </button>
  );
}