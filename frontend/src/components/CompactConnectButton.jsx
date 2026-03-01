import { useState } from 'react';
import axios from 'axios';
import { UserPlus, Loader2, CheckCircle2, Clock } from 'lucide-react';

// API instance yahan define kar diya hai taaki Canvas mein compilation error na aaye
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true
});

export default function CompactConnectButton({ targetUserId, isConnected, initialIsPending }) {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  // 👉 FIX 1: Sirf Optimistic (turant) update ke liye state banaya, sync karne ki jhanjhat khatam
  const [optimisticPending, setOptimisticPending] = useState(false);
  const [optimisticConnected, setOptimisticConnected] = useState(false);

  // 👉 FIX 2: Derived State - Agar parent ne true bheja, ya humne turant click kiya, dono case mein True manega
  const finalConnected = isConnected || optimisticConnected;
  const finalPending = initialIsPending || optimisticPending;

  const handleConnect = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Agar pehle se connected ya requested hai, toh request mat bhejo
    if (!targetUserId || finalConnected || finalPending || loading) {
      if (!targetUserId) setErrorText('Error: ID missing');
      return;
    }

    setLoading(true);
    setErrorText(''); 

    try {
      // Backend call
      await API.post(`/users/connect/${targetUserId}`);
      
      // Success hote hi INSTANTLY pending badge dikhao
      setOptimisticPending(true); 

      // Background mein App ko sync karne bol do
      window.dispatchEvent(new Event('profileUpdated'));

    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message?.toLowerCase() || '';
      
      if (err.response?.status === 404) {
        setErrorText('Route not found (404)');
      } else if (err.response?.status === 400) {
        
        // Agar backend bole ki pehle se "connected" ya "friend" ho:
        if (errorMsg.includes('connected') || errorMsg.includes('friend') || errorMsg.includes('accepted')) {
          setOptimisticConnected(true);
        } else {
          // Agar backend bole ki pehle se "request sent" hai:
          setOptimisticPending(true); 
        }
        
      } else {
        setErrorText('Connection failed!');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1️⃣ Sabse pehle Connected status check hoga
  if (finalConnected) {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 text-[11px] font-bold rounded-full border border-green-500/20 cursor-default shadow-sm">
        <CheckCircle2 size={12} /> Connected
      </div>
    );
  }

  // 2️⃣ Agar connected nahi hai, par Requested hai
  if (finalPending) {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-pink-500/10 text-gray-500 text-[11px] font-bold rounded-full border border-gray-500/20 cursor-default shadow-sm">
        <Clock size={12} /> Requested
      </div>
    );
  }

  // 3️⃣ Agar dono nahi hai, toh Connect karne ka option do
  return (
    <div className="flex flex-col items-center relative">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white text-black rounded-full text-[12px] font-black hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md relative z-10"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
        {loading ? "Wait..." : "Connect"}
      </button>
      
      {/* Error message */}
      {errorText && (
        <span className="absolute top-[110%] text-red-500 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-20 shadow-sm">
          {errorText}
        </span>
      )}
    </div>
  );
}