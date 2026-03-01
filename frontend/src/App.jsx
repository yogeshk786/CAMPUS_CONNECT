import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages & Components
import Landing from './pages/Landing'; 
import Feed from './pages/feed';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar'; 

const ProtectedLayout = ({ children, user, onLogout, isDarkMode, toggleTheme }) => {
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex justify-center overflow-x-hidden transition-colors duration-500">
      <div className="w-full max-w-[1265px] flex justify-between">
        
        {/* Left Sidebar */}
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={user} onLogout={onLogout} />
        </div>
        
        {/* Main Content Area */}
        <main className="w-full max-w-[600px] border-x border-gray-200 dark:border-white/10 min-h-screen transition-colors duration-500 relative z-10">
          {children}
        </main>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block w-[350px] pl-8 py-3">
          <RightSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
        
      </div>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedData = localStorage.getItem('userInfo');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return parsedData.user ? parsedData.user : parsedData;
      } catch (error) { return null; }
    }
    return null; 
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true; 
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  useEffect(() => {
    const syncUser = () => {
      const storedData = localStorage.getItem('userInfo');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCurrentUser(parsedData.user ? parsedData.user : parsedData);
      } else {
        setCurrentUser(null);
      }
    };
    window.addEventListener('profileUpdated', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('profileUpdated', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const handleAuthSuccess = () => {
    const storedData = localStorage.getItem('userInfo');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setCurrentUser(parsedData.user ? parsedData.user : parsedData);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          currentUser ? <Navigate to="/feed" replace /> : <Landing onAuthSuccess={handleAuthSuccess} />
        } />
        
        <Route path="/feed" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
            <Feed user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="/notifications" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
            <Notifications user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="/profile" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
            <Profile user={currentUser} />
          </ProtectedLayout>
        } />

        {/* 👉 THE FIX: Dusre users ki profile par jane ke liye yeh route zaroori hai */}
        <Route path="/user/:id" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
            <Profile user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;