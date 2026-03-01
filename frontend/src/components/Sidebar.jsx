import React, { useState, useEffect, useCallback } from 'react'; 
import { Home, Bell, User, LogOut, Sparkles } from 'lucide-react';
import { useNavigate, useLocation, useInRouterContext } from 'react-router-dom';
import { createPortal } from 'react-dom'; // 👉 Modal Trap fix ke liye

// 👉 Main UI Component: Pure GenZ, Colorful & Theme Responsive
function SidebarView({ user, onLogout, navigate, location }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUnreadCount(3); 
    }, 100); 
    return () => clearTimeout(timer); 
  }, []); 

  const handleFinalLogout = useCallback(() => {
    setShowLogoutModal(false);
    if (onLogout) onLogout(); 
    localStorage.removeItem('userInfo');
    navigate('/'); 
  }, [onLogout, navigate]);

  return (
    <>
      {/* 👉 THEME UPGRADE: bg-white dark:bg-[#050505] */}
      <aside className="w-[80px] xl:w-[280px] sticky top-0 z-[50] h-screen flex flex-col justify-between py-4 px-2 xl:px-4 border-r border-gray-200 dark:border-white/5 bg-white/90 dark:bg-[#050505]/95 backdrop-blur-2xl select-none transition-colors duration-500">
        
        <div className="flex flex-col items-center xl:items-start w-full">
          
          {/* 🚀 Animated Logo Section */}
          <div 
            onClick={() => navigate('/feed')} 
            className="relative p-1 mb-6 xl:ml-2 rounded-full cursor-pointer group transition-all duration-300 active:scale-90"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
            {/* Theme responsive logo box */}
            <div className="relative bg-white dark:bg-black p-2 rounded-full border border-gray-200 dark:border-white/10 transition-colors duration-500">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          {/* 🌈 Navigation Links */}
          <nav className="space-y-3 w-full font-bold">
            <NavItem 
              icon={<Home size={24} />} 
              label="Feed" 
              active={location.pathname === '/feed'} 
              onClick={() => navigate('/feed')} 
            />

            <div 
              onClick={() => navigate('/notifications')} 
              className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 w-full active:scale-95 group relative
                ${location.pathname === '/notifications' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white hover:translate-x-1'}`}
            >
              <div className="relative flex justify-center xl:justify-start">
                <div className={`${location.pathname === '/notifications' ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                  <Bell size={24} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-[2px] border-white dark:border-[#050505] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-[17px] tracking-wide">Notifications</span>
            </div>

            <NavItem 
              icon={<User size={24} />} 
              label="Profile" 
              active={location.pathname === '/profile'} 
              onClick={() => navigate('/profile')} 
            />
          </nav>
        </div>

        {/* 👤 User Section & Logout Trigger */}
        <div 
          onClick={() => setShowLogoutModal(true)} 
          className="mt-4 flex items-center gap-3 p-2 xl:p-3 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-[2rem] cursor-pointer group transition-all duration-300 active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-white/5"
        >
          <div className="relative p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 rounded-full flex-shrink-0">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Vibe'}`} 
              className="w-10 h-10 xl:w-11 xl:h-11 rounded-full border-2 border-white dark:border-black object-cover bg-gray-100 dark:bg-gray-900 transition-colors duration-500" 
              alt="Avatar"
            />
          </div>
          <div className="hidden xl:block overflow-hidden w-full">
            <p className="font-black text-gray-900 dark:text-white text-[15px] truncate transition-colors duration-500">{user?.name || 'Vibe Seeker'}</p>
            <p className="text-gray-500 dark:text-gray-400 text-[13px] font-mono truncate tracking-tight transition-colors duration-500">@{user?.handle || 'user'}</p>
          </div>
          <LogOut size={20} className="hidden xl:block ml-auto text-gray-400 dark:text-gray-600 group-hover:text-red-500 transition-colors duration-300" />
        </div>
      </aside>

      {/* 🔮 PORTAL FIX: Glassmorphism Logout Modal */}
      {showLogoutModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 max-w-[340px] w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors duration-500">
            
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/20 blur-[50px] rounded-full"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-full mb-5 border border-red-100 dark:border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-red-500">
                 <LogOut size={32} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter transition-colors duration-500">Sign Out?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[14px] mb-8 font-medium transition-colors duration-500">
                Taking a break? We'll keep your vibes safe until you return. ✨
              </p>
              
              <div className="flex flex-col gap-3 w-full font-black">
                <button
                  onClick={(e) => { e.stopPropagation(); handleFinalLogout(); }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.3)] text-lg"
                >
                  Yes, Log out
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowLogoutModal(false); }}
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// 👉 Safe Wrapper for Router Context
function SidebarWithRouter(props) {
  const navigate = useNavigate();
  const location = useLocation();
  return <SidebarView {...props} navigate={navigate} location={location} />;
}

export default function Sidebar(props) {
  const hasRouter = useInRouterContext(); 
  
  if (hasRouter) {
    return <SidebarWithRouter {...props} />;
  }
  
  // Fallback for Canvas/Preview
  const mockNavigate = (path) => console.log(`[Mock Navigate]: To ${path}`);
  const mockLocation = { pathname: '/feed' };
  return <SidebarView {...props} navigate={mockNavigate} location={mockLocation} />;
}

// 🧭 Dynamic NavItem Component (Theme Aware)
function NavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 w-full active:scale-95 group
        ${active 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white hover:translate-x-1'}`}
    >
      <div className={`flex justify-center xl:justify-start ${active ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
        {icon}
      </div>
      <span className="hidden xl:inline text-[17px] tracking-wide">{label}</span>
      {active && <Sparkles size={14} className="hidden xl:block ml-auto text-blue-200 animate-pulse" />}
    </div>
  );
}