import React from 'react';
import { Sun, Moon, Sparkles, UserPlus } from 'lucide-react';
import SearchBar from './SearchBar';

// 👉 PROPS: App.jsx se isDarkMode aur toggleTheme yahan aayenge
export default function RightSidebar({ isDarkMode, toggleTheme }) {
  // Dummy data
  const suggestedUsers = [
    { _id: '1', name: 'Alumni Network', handle: 'alumni_cell', dept: 'University' },
    { _id: '2', name: 'Tech Club', handle: 'tech_geeks', dept: 'CS' },
  ];

  return (
    <aside className="w-full sticky top-4">
      {/* 🔍 Search Bar (Aapka original component) */}
      <SearchBar />

      {/* 🌗 THEME TOGGLE WIDGET */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] p-5 shadow-sm dark:shadow-[0_0_30px_rgba(255,255,255,0.02)] transition-colors duration-500 mt-6">
        <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-500">
          Vibe Settings <Sparkles size={18} className="text-[#1d9bf0]" />
        </h3>

        <div className="flex items-center justify-between bg-gray-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors duration-500">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            {isDarkMode ? <Moon size={20} className="text-indigo-500 animate-in spin-in" /> : <Sun size={20} className="text-orange-500 animate-in spin-in" />}
            <span className="font-bold">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          
          {/* Custom Animated Toggle Switch */}
          <button 
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 outline-none cursor-pointer shadow-inner ${isDarkMode ? 'bg-[#1d9bf0]' : 'bg-gray-300'}`}
          >
            <div 
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}
            ></div>
          </button>
        </div>
      </div>

      {/* 🤝 SUGGESTED CONNECTIONS WIDGET */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-200 dark:border-white/10 pt-5 mt-4 shadow-sm dark:shadow-[0_0_30px_rgba(255,255,255,0.02)] transition-colors duration-500 overflow-hidden">
        <h3 className="text-lg font-black px-5 mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          Suggested Squad <UserPlus size={18} className="text-pink-500" />
        </h3>
        
        <div className="flex flex-col">
          {suggestedUsers.map((user) => (
            <div key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.04] px-5 py-4 cursor-pointer transition-colors duration-300 flex items-center justify-between group">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* GenZ Gradient Avatar */}
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white uppercase text-lg shadow-md group-hover:scale-105 transition-transform">
                  {user.name?.[0] || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#1d9bf0] dark:group-hover:text-[#1d9bf0] truncate text-[15px] transition-colors">
                    {user.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-[13px] font-medium truncate">
                    @{user.handle}
                  </span>
                </div>
              </div>
              
              {/* Dynamic Button (Dark in Light Mode, Light in Dark Mode) */}
              <button className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors active:scale-95 shadow-md">
                Connect
              </button>
            </div>
          ))}
        </div>

        {/* Show More Footer */}
        <div className="p-5 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors duration-300 cursor-pointer rounded-b-[2rem] border-t border-gray-100 dark:border-white/5">
          <span className="text-[#1d9bf0] font-bold text-[15px] hover:underline">Show more</span>
        </div>
      </div>

      {/* Footer / Copyright Links */}
      <div className="px-5 mt-6 text-[13px] text-gray-400 dark:text-gray-500 font-medium flex flex-wrap gap-x-3 gap-y-1">
        <span className="hover:underline cursor-pointer">Terms of Service</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Cookie Policy</span>
        <span className="hover:underline cursor-pointer">Accessibility</span>
        <span>© 2026 Campus GenZ</span>
      </div>

    </aside>
  );
}