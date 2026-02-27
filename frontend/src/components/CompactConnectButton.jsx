import { useState } from 'react';
import API from '../api/axios';
import { UserPlus, Clock } from 'lucide-react';

export default function CompactConnectButton({ targetUserId, isConnected, isPending }) {
  const [status, setStatus] = useState(
    isConnected ? 'connected' : isPending ? 'pending' : 'none'
  );
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e) => {
    e.stopPropagation(); 
    if (status !== 'none') return; 

    setLoading(true);
    try {
      await API.post(`/users/${targetUserId}/connect`); 
      setStatus('pending'); 
    } catch (error) {
      console.error("Connection request fail ho gayi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'connected') return null;

  return (
    <button
      onClick={handleConnect}
      disabled={loading || status === 'pending'}
      className={`ml-2 flex items-center gap-1.5 text-[13px] font-bold px-3 py-1 rounded-full transition-all border
        ${status === 'pending'
          ? 'bg-transparent text-gray-400 border-gray-700 cursor-default'
          : 'bg-white text-black border-transparent hover:bg-gray-200 active:scale-95'
        }`}
    >
      {loading ? (
        <span className="px-2">...</span>
      ) : status === 'pending' ? (
        <><Clock size={14} /> <span>Pending</span></>
      ) : (
        <><UserPlus size={14} /> <span>Connect</span></>
      )}
    </button>
  );
}