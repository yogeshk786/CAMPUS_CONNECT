import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Check, X } from 'lucide-react';

// 👉 THE FIX: 'user' prop direct App.jsx ke ProtectedLayout se aayega
export default function Notifications({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await API.get('/users/profile');
        setRequests(data.pendingRequests || []);
      } catch (err) {
        console.error("Requests fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleAction = async (id, action) => {
    try {
      await API.post(`/users/${id}/${action}`);
      setRequests((prev) => prev.filter(req => req._id !== id));
    } catch (err) {
      console.error(`${action} failed:`, err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Please login to see notifications.</p>
      </div>
    );
  }

  // 👉 THE FIX: Removed Sidebar, RightSidebar, and outer layout wrapper.
  // Direct return center content.
  return (
    <>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-800/60 z-20 cursor-pointer">
        <h2 className="text-[20px] font-bold">Connect Requests</h2>
      </header>

      <div className="pb-20">
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin h-8 w-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No pending requests.
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {requests.map((reqUser) => (
              <div key={reqUser._id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  {/* Photo Profile update logic */}
                  <img 
                    src={reqUser.avatar || `https://ui-avatars.com/api/?name=${reqUser.name || 'U'}&background=random`} 
                    alt={reqUser.name}
                    className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center object-cover border border-gray-800"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${reqUser.name || 'U'}`; }}
                  />
                  <div>
                    <p className="font-bold text-white leading-tight">{reqUser.name}</p>
                    <p className="text-gray-500 text-sm">@{reqUser.handle}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleAction(reqUser._id, 'reject')} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition cursor-pointer">
                    <X size={22} />
                  </button>
                  <button onClick={() => handleAction(reqUser._id, 'accept')} className="bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition cursor-pointer">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}