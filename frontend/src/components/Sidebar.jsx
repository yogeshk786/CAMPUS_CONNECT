import React, { useState, useCallback, useMemo } from 'react'; 
import { Home, Bell, User, LogOut, Sparkles, Radio, AudioLines, Rocket } from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom'; 

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ FIX 1: Real-time notification count from Database
  const unreadCount = useMemo(() => {
    return user?.pendingRequests?.length || 0;
  }, [user?.pendingRequests]);

  const handleFinalLogout = useCallback(() => {
    setShowLogoutModal(false);
    if (onLogout) onLogout(); 
    localStorage.removeItem('userInfo');
    navigate('/'); 
  }, [onLogout, navigate]);

  return (
    <>
      {/* ✅ FIX 2: Changed to 'fixed' so it NEVER moves up with the feed */}
      <aside className="hidden md:flex fixed top-0 w-[80px] xl:w-[280px] z-[50] h-screen flex-col justify-between py-4 px-2 xl:px-4 border-r border-gray-200 dark:border-white/5 bg-white/90 dark:bg-[#050505]/95 backdrop-blur-2xl select-none transition-colors duration-500 overflow-hidden">
        
        <div className="flex flex-col items-center xl:items-start w-full h-full overflow-hidden">
          
          {/* Animated Logo Section */}
          <div 
            onClick={() => navigate('/feed')} 
            className="relative p-1 mb-6 xl:ml-2 rounded-full cursor-pointer group transition-all duration-300 active:scale-90 flex-shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative bg-white dark:bg-black p-2 rounded-full border border-gray-200 dark:border-white/10 transition-colors duration-500">
              <img 
                 src="/logo.png" 
                 alt="Campus Connect" 
                 className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300"
                 onError={(e) => {
                   e.target.style.display = 'none';
                   e.target.nextSibling.style.display = 'flex';
                 }}
               />
               <div className="hidden w-9 h-9 items-center justify-center font-black text-blue-500 text-xl italic">CC</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3 w-full font-bold overflow-y-auto scrollbar-hide flex-1 pb-4 pr-1">
            <NavItem 
              icon={<Home size={24} />} 
              label="Feed" 
              active={location.pathname === '/feed'} 
              onClick={() => navigate('/feed')} 
            />

            {/* ✅ FIX 3: Colorful NavItems for special features */}
            <NavItem 
              icon={<Radio size={24} />} 
              label="Campus Voice" 
              active={location.pathname === '/rooms'} 
              onClick={() => navigate('/rooms')} 
              isSpecial={true}
              specialColor="green"
            />

            <div 
              onClick={() => navigate('/notifications')} 
              className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 w-full active:scale-95 group relative
                ${location.pathname === '/notifications' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white font-black' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white hover:translate-x-1'}`}
            >
              <div className="relative flex justify-center xl:justify-start">
                <div className={`${location.pathname === '/notifications' ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                  <Bell size={24} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-[2px] border-white dark:border-[#050505] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-[17px] tracking-wide">Notifications</span>
            </div>

            <NavItem 
              icon={<Rocket size={24} />} 
              label="Launchpad" 
              active={location.pathname === '/launchpad'} 
              onClick={() => navigate('/launchpad')} 
              isSpecial={true}
              specialColor="orange"
            />

            <NavItem 
              icon={<User size={24} />} 
              label="Profile" 
              active={location.pathname === '/profile'} 
              onClick={() => navigate('/profile')} 
            />
          </nav>
        </div>

        {/* User Section & Logout Trigger */}
        <div 
          onClick={() => setShowLogoutModal(true)} 
          className="mt-2 flex items-center gap-3 p-2 xl:p-3 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-[2rem] cursor-pointer group transition-all duration-300 active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-white/5 flex-shrink-0"
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

      {/* Logout Modal Portal */}
      {showLogoutModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 text-white">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 max-w-[340px] w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors duration-500">
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

// ✅ FIX 4: Upgraded NavItem to support gradients for special routes
function NavItem({ icon, label, active, onClick, isSpecial, specialColor }) {
  const activeClass = isSpecial 
    ? (specialColor === 'green' ? 'from-green-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'from-orange-500 to-red-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]')
    : 'from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]';

  const hoverClass = isSpecial
    ? (specialColor === 'green' ? 'hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600' : 'hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600')
    : 'hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white';

  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 w-full active:scale-95 group relative
        ${active 
          ? `bg-gradient-to-r ${activeClass} text-white font-black` 
          : `text-gray-500 dark:text-gray-400 ${hoverClass} hover:translate-x-1`}`}
    >
      <div className={`flex justify-center xl:justify-start ${active ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
        {icon}
      </div>
      <span className="hidden xl:inline text-[17px] tracking-wide">{label}</span>
      {active && <Sparkles size={14} className="hidden xl:block ml-auto text-white/50 animate-pulse" />}
    </div>
  );
}