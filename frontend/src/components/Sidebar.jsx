import { useEffect, useState } from 'react';
import { Home, Bell, User, LogOut, GraduationCap, Search, Bookmark } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestCount, setRequestCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch Pending Requests Count (Notifications Badge)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { data } = await API.get('/users/profile');
        setRequestCount(data.pendingRequests?.length || 0);
      } catch (err) {
        console.error("Count fetch error:", err);
      }
    };
    
    if (user) {
      fetchCount();
      const interval = setInterval(fetchCount, 30000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <aside className="w-20 xl:w-[275px] sticky top-0 h-screen flex flex-col justify-between py-2 xl:pr-6 border-r border-gray-800/40">
      <div className="flex flex-col items-center xl:items-start">
        {/* App Logo */}
        <div 
          onClick={() => navigate('/feed')} 
          className="p-3 mb-2 hover:bg-blue-500/10 rounded-full cursor-pointer transition text-[#1d9bf0] w-fit"
        >
          <GraduationCap size={34} />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 w-full">
          <div onClick={() => navigate('/feed')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-8 ${location.pathname === '/feed' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <Home size={26} /> <span className="text-[20px] hidden xl:inline">Home</span>
          </div>

          <div onClick={() => navigate('/explore')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-8 ${location.pathname === '/explore' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <Search size={26} /> <span className="text-[20px] hidden xl:inline">Explore</span>
          </div>

          <div onClick={() => navigate('/notifications')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-8 ${location.pathname === '/notifications' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <div className="relative">
              <Bell size={26} />
              {requestCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1d9bf0] text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-black animate-in fade-in zoom-in">
                  {requestCount > 9 ? '9+' : requestCount}
                </span>
              )}
            </div>
            <span className="text-[20px] hidden xl:inline">Notifications</span>
          </div>

          <div onClick={() => navigate('/bookmarks')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-8 ${location.pathname === '/bookmarks' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <Bookmark size={26} /> <span className="text-[20px] hidden xl:inline">Bookmarks</span>
          </div>

          <div onClick={() => navigate('/profile')} className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-8 ${location.pathname === '/profile' ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}>
            <User size={26} /> <span className="text-[20px] hidden xl:inline">Profile</span>
          </div>
        </nav>
      </div>

      {/* 👉 User Profile & Logout Section (Avatar Fix) */}
      <div 
        onClick={() => setShowLogoutModal(true)} 
        className="mb-4 flex items-center justify-center xl:justify-between p-3 hover:bg-gray-900 rounded-full cursor-pointer transition group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* 👉 THE SMART FIX: Checking profilePic, avatar, and adding onError */}
          <img 
            src={user?.profilePic || user?.avatar || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
            className="w-10 h-10 rounded-full object-cover border border-gray-800 bg-gray-900 transition-transform group-hover:scale-105"
            alt="User Profile"
            onError={(e) => { 
              e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'U'}`; 
            }}
          />
          <div className="hidden xl:block overflow-hidden">
            <p className="font-bold text-[15px] leading-tight text-white truncate">{user?.name}</p>
            <p className="text-gray-500 text-[14px] truncate">@{user?.handle || user?.username}</p>
          </div>
        </div>
        <LogOut size={20} className="hidden xl:block text-gray-500 group-hover:text-red-500 transition-colors" />
      </div>

      {/* 🌟 ULTRA MODERN LOGOUT MODAL 🌟 */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#15202b] border border-gray-800 rounded-3xl p-8 max-w-[340px] w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#1d9bf0]/10 p-4 rounded-full mb-4">
                 <GraduationCap size={40} className="text-[#1d9bf0]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Log out?</h3>
              <p className="text-gray-400 text-[15px] mb-8 leading-relaxed">
                Are you sure you want to log out of CampusConnect? You'll need to sign in again to access your feed.
              </p>
              
              <div className="flex flex-col gap-3 w-full font-bold">
                <button
                  onClick={handleLogout}
                  className="w-full bg-white text-black py-3.5 rounded-full hover:bg-gray-200 transition active:scale-95 shadow-lg shadow-white/5"
                >
                  Log out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full bg-transparent border border-gray-700 text-white py-3.5 rounded-full hover:bg-gray-800 transition active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}