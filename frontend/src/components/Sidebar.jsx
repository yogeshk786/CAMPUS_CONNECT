import { useState, useEffect, useCallback } from 'react'; 
import { Home, Bell, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 👉 FIXED: useEffect ko clean rakha hai loop se bachne ke liye
  useEffect(() => {
    // Isse React render cycle ke baad call karega, loop nahi banega
    const timer = setTimeout(() => {
      setUnreadCount(3); 
    }, 100); 

    return () => clearTimeout(timer); // Cleanup memory leak se bachne ke liye
  }, []); 

  // 👉 Memoized Logout: Taaki modal open hone par Sidebar re-render na ho
  const handleFinalLogout = useCallback(() => {
    setShowLogoutModal(false);
    if (onLogout) onLogout(); 
    localStorage.removeItem('userInfo');
    navigate('/'); 
  }, [onLogout, navigate]);

  return (
    <aside className="w-20 xl:w-[275px] sticky top-0 h-screen flex flex-col justify-between py-2 border-r border-gray-800/40 bg-black select-none">
      <div className="flex flex-col items-center xl:items-start">
        
        {/* Logo Section */}
        <div 
          onClick={() => navigate('/feed')} 
          className="p-3 mb-2 hover:bg-white/5 rounded-full cursor-pointer transition-all duration-200 text-[#1d9bf0] w-fit active:scale-95"
        >
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="space-y-1 w-full font-medium">
          <NavItem 
            icon={<Home size={26} />} 
            label="Home" 
            active={location.pathname === '/feed'} 
            onClick={() => navigate('/feed')} 
          />

          <div 
            onClick={() => navigate('/notifications')} 
            className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition-all duration-200 w-fit xl:pr-8 active:scale-95 ${location.pathname === '/notifications' ? 'font-bold text-white' : 'text-gray-300'} hover:bg-gray-900`}
          >
            <div className="relative">
              <Bell size={26} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1d9bf0] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-black animate-in fade-in zoom-in duration-300">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-[19px]">Notifications</span>
          </div>

          <NavItem 
            icon={<User size={26} />} 
            label="Profile" 
            active={location.pathname === '/profile'} 
            onClick={() => navigate('/profile')} 
          />
        </nav>
      </div>

      {/* User Section & Logout Trigger */}
      <div 
        onClick={() => setShowLogoutModal(true)} 
        className="mb-4 flex items-center gap-3 p-3 hover:bg-gray-900 rounded-full cursor-pointer group transition-all duration-200 active:scale-95"
      >
        <div className="relative">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} 
            className="w-10 h-10 rounded-full border border-gray-800 object-cover bg-gray-900" 
            alt="Avatar"
          />
        </div>
        <div className="hidden xl:block overflow-hidden">
          <p className="font-bold text-white text-[15px] truncate max-w-[140px]">{user?.name}</p>
          <p className="text-gray-500 text-[14px] truncate max-w-[140px]">@{user?.handle || 'username'}</p>
        </div>
        <LogOut size={20} className="hidden xl:block ml-auto text-gray-500 group-hover:text-red-500 transition-colors" />
      </div>

      {/* Logout Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#15202b] border border-gray-800 rounded-3xl p-8 max-w-[340px] w-full animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#1d9bf0]/10 p-4 rounded-full mb-4">
                 <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Log out?</h3>
              <p className="text-gray-400 text-[15px] mb-8 leading-relaxed">
                Confirming will end your session and take you back to the landing page.
              </p>
              
              <div className="flex flex-col gap-3 w-full font-bold">
                <button
                  onClick={handleFinalLogout}
                  className="w-full bg-white text-black py-3.5 rounded-full hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-lg shadow-white/5"
                >
                  Log out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full bg-transparent border border-gray-700 text-white py-3.5 rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
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

// 🧭 Small Helper Component for Clean Code
function NavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition-all duration-200 w-fit xl:pr-8 active:scale-95 ${active ? 'font-bold text-white' : 'text-gray-300'} hover:bg-gray-900`}
    >
      {icon} <span className="hidden xl:inline text-[19px]">{label}</span>
    </div>
  );
}