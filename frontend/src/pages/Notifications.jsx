import React, { useEffect, useState } from 'react';
import API from '../api/axios';
// 👉 Path double check karein: ../components/
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import { Check, X } from 'lucide-react';

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedData = JSON.parse(storedUser);
        return parsedData.user || parsedData;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

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

  // Agar user nahi hai, toh blank screen se bachne ke liye text dikhayein
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Please login to see notifications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1265px] flex justify-between">
        
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={user} />
        </div>

        <main className="w-full max-w-[600px] border-x border-gray-800 min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-800 z-20">
            <h2 className="text-[20px] font-bold">Connect Requests</h2>
          </header>

          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin h-8 w-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No pending requests.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {requests.map((reqUser) => (
                <div key={reqUser._id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold uppercase">
                      {reqUser.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{reqUser.name}</p>
                      <p className="text-gray-500 text-sm">@{reqUser.handle}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleAction(reqUser._id, 'reject')} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition">
                      <X size={22} />
                    </button>
                    <button onClick={() => handleAction(reqUser._id, 'accept')} className="bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className="hidden lg:block w-[350px] pl-8 py-3">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}