import React, { useEffect, useState, useCallback } from 'react';
import { Flame, Sparkles, RefreshCw, Zap, Compass, Sun, Moon } from 'lucide-react';

// 👉 Asli imports
import API from '../api/axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 👉 Theme State (LocalStorage se check karega pehle)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true; // Default dark
  });

  // 👉 Theme Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // 👉 Fetch Posts Logic
  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await API.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error("Posts load nahi ho payi:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    // 👉 ADDED: dark:bg-[#050505] aur light mode colors
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-purple-500/30 relative overflow-hidden transition-colors duration-500">
      
      {/* 🌌 Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-all duration-500" />
      <div className="fixed top-[40%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-all duration-500" />

      {/* 🚀 STICKY GLASS HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#050505]/60 backdrop-blur-2xl px-4 md:px-6 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm dark:shadow-lg dark:shadow-black/20 transition-colors duration-500">
        <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
          FOR YOU <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
        </h2>
        
        <div className="flex items-center gap-3">
          {/* 🌓 Dark/Light Mode Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-gray-100 dark:bg-white/[0.03] hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative overflow-hidden group"
          >
            <div className="relative z-10 flex items-center justify-center transition-transform duration-500">
              {isDarkMode ? <Sun size={20} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-in spin-in duration-500" /> : <Moon size={20} className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-in spin-in duration-500" />}
            </div>
          </button>

          {/* 🔄 Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2.5 bg-gray-100 dark:bg-white/[0.03] hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] group ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={20} className={`text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors ${isRefreshing ? 'animate-spin text-[#1d9bf0] dark:text-[#1d9bf0]' : ''}`} />
          </button>
        </div>
      </header>

      <div className="relative z-10 pb-24 px-3 md:px-0 max-w-2xl mx-auto mt-4">
        
        {/* ✨ CREATE POST SECTION */}
        <div className="mb-6 bg-white dark:bg-gradient-to-b dark:from-white/[0.02] dark:to-transparent rounded-[2rem] p-1 border border-gray-200 dark:border-white/5 shadow-md dark:shadow-2xl transition-colors duration-500">
          <CreatePost 
            user={user} 
            onPostCreated={(newPost) => setPosts([newPost, ...posts])} 
          />
        </div>

        {/* 🔄 CONTENT FEED MANAGER */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#1d9bf0] blur-2xl opacity-20 rounded-full animate-pulse" />
              <div className="animate-spin h-14 w-14 border-4 border-dashed border-[#1d9bf0] border-t-transparent rounded-full shadow-[0_0_20px_rgba(29,155,240,0.5)]" />
              <Zap className="absolute text-[#1d9bf0] animate-pulse" size={24} />
            </div>
            <p className="text-[#1d9bf0] font-mono text-xs font-black uppercase tracking-[0.4em] animate-pulse mt-2 drop-shadow-[0_0_8px_rgba(29,155,240,0.5)]">
              Syncing Vibes...
            </p>
          </div>
        ) : posts.length === 0 ? (
          // 📭 Empty State
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700 slide-in-from-bottom-6">
            <div className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/5 mb-6 shadow-sm dark:shadow-[0_0_40px_rgba(255,255,255,0.03)] flex items-center justify-center relative overflow-hidden group hover:border-gray-300 dark:hover:border-white/10 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Compass size={56} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-3 text-gray-800 dark:text-white">It's quiet here...</h3>
            <p className="text-gray-500 dark:text-gray-500 font-medium text-lg max-w-sm">
              Be the first to drop some vibes and start the conversation! ✨
            </p>
          </div>
        ) : (
          // 📱 Post List
          <div className="flex flex-col gap-4">
            {posts.map((post, index) => (
              <div 
                key={post._id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationFillMode: 'both', animationDelay: `${index * 120}ms` }} 
              >
                <PostCard 
                  post={post} 
                  currentUser={user} 
                />
              </div>
            ))}
            
            {/* End of Feed Indicator */}
            <div className="py-16 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-500">
              <Sparkles size={28} className="text-gray-400 dark:text-gray-400 mb-3" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">You're all caught up</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}