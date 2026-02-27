import { useEffect, useState } from 'react';
import { Home, Bell, Mail, Bookmark, User, Hash, LogOut, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestCount, setRequestCount] = useState(0);

  // 👉 Fetch Pending Requests Count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { data } = await API.get('/users/profile');
        setRequestCount(data.pendingRequests?.length || 0);
      } catch (err) {
        console.error("Count fetch error:", err);
      }
    };
    
    // Sirf tab fetch karein jab user logged in ho
    if (user) {
      fetchCount();
      // Har 30 second mein check karein (polling)
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <aside className="w-20 xl:w-[275px] sticky top-0 h-screen flex flex-col justify-between py-2 xl:pr-6">
      <div className="flex flex-col items-center xl:items-start">
        <div onClick={() => navigate('/feed')} className="p-3 mb-2 hover:bg-gray-900 rounded-full cursor-pointer transition text-blue-500 w-fit">
          <GraduationCap size={32} />
        </div>

        <nav className="space-y-1 w-full">
          {/* Home */}
          <div onClick={() => navigate('/feed')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-6 ${location.pathname === '/feed' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <Home size={26} /> <span className="text-[20px] hidden xl:inline">Home</span>
          </div>

          {/* Notifications (With Badge) */}
          <div onClick={() => navigate('/notifications')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-6 relative ${location.pathname === '/notifications' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <div className="relative">
              <Bell size={26} />
              {/* 👉 RED BADGE LOGIC */}
              {requestCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1d9bf0] text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-black">
                  {requestCount > 9 ? '9+' : requestCount}
                </span>
              )}
            </div>
            <span className="text-[20px] hidden xl:inline">Notifications</span>
          </div>

          {/* Profile */}
          <div onClick={() => navigate('/profile')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-6 ${location.pathname === '/profile' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <User size={26} /> <span className="text-[20px] hidden xl:inline">Profile</span>
          </div>
        </nav>
      </div>

      {/* User Info & Logout */}
      <div onClick={handleLogout} className="mb-4 flex items-center justify-center xl:justify-between p-3 hover:bg-gray-900 rounded-full cursor-pointer transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white uppercase">
            {user?.name?.[0]}
          </div>
          <div className="hidden xl:block">
            <p className="font-bold text-[15px] leading-tight text-white">{user?.name}</p>
            <p className="text-gray-500 text-[15px]">@{user?.handle}</p>
          </div>
        </div>
        <LogOut size={18} className="hidden xl:block text-gray-400" />
      </div>
    </aside>
  );
}