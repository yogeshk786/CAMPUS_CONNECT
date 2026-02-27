import { Home, Bell, Mail, Bookmark, User, Hash, LogOut, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const menuItems = [
    { icon: <Home size={26} />, label: 'Home', active: true },
    { icon: <Hash size={26} />, label: 'Explore' },
    { icon: <Bell size={26} />, label: 'Notifications' },
    { icon: <Mail size={26} />, label: 'Messages' },
    { icon: <Bookmark size={26} />, label: 'Bookmarks' },
    { icon: <User size={26} />, label: 'Profile' },
  ];

  return (
    <aside className="w-20 xl:w-[275px] sticky top-0 h-screen flex flex-col justify-between py-2 xl:pr-6">
      <div className="flex flex-col items-center xl:items-start">
        <div className="p-3 mb-2 hover:bg-gray-900 rounded-full cursor-pointer transition w-fit text-blue-500">
          <GraduationCap size={32} />
        </div>

        <nav className="space-y-1 w-full">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition w-fit xl:pr-6
                ${item.active ? 'font-bold text-white' : 'text-gray-200'} hover:bg-gray-900`}
            >
              {item.icon}
              <span className="text-[20px] hidden xl:inline">{item.label}</span>
            </div>
          ))}
        </nav>

        <button className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-lg w-12 h-12 xl:w-full xl:h-auto xl:py-3 rounded-full mt-4 transition shadow-lg">
          <span className="hidden xl:inline">Post</span>
          <span className="xl:hidden">+</span>
        </button>
      </div>

      <div 
        onClick={handleLogout}
        className="mb-4 flex items-center justify-center xl:justify-between p-3 hover:bg-gray-900 rounded-full cursor-pointer transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white uppercase">
            {user?.name?.[0] || "U"}
          </div>
          <div className="hidden xl:block">
            <p className="font-bold text-[15px] leading-tight text-white">{user?.name || "Student"}</p>
            <p className="text-gray-500 text-[15px]">@{user?.handle || "campus_user"}</p>
          </div>
        </div>
        <LogOut size={18} className="hidden xl:block text-gray-400" />
      </div>
    </aside>
  );
}