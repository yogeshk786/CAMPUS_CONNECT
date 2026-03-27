import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// 👉 IMPORT Google Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

import API from './api/axios'; 
import Landing from './pages/Landing'; 
import Feed from './pages/Feed';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar'; 
import { UserProvider } from './contexts/UserContext';
import LiveChat from './components/LiveChats'; 
import Launchpad from './pages/Launchpad';

const ProtectedLayout = ({ children, user, onLogout, isDarkMode, toggleTheme }) => {
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex justify-center overflow-x-hidden transition-colors duration-500 relative">
      <div className="w-full max-w-[1265px] flex justify-between">
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={user} onLogout={onLogout} />
        </div>
        <main className="w-full max-w-[600px] border-x border-gray-200 dark:border-white/10 min-h-screen transition-colors duration-500 relative z-10 pb-[80px] md:pb-0">
          {children}
        </main>
        <div className="hidden lg:block w-[350px] pl-8 py-3">
          <RightSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </div>
      <LiveChat />
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
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
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

    const fetchFreshData = async () => {
      const storedData = localStorage.getItem('userInfo');
      if (!storedData) return;

      try {
        const { data: freshUser } = await API.get('/users/profile');
        const parsedData = JSON.parse(storedData);
        const updatedStorage = { ...parsedData, user: freshUser };
        localStorage.setItem('userInfo', JSON.stringify(updatedStorage));
        setCurrentUser(freshUser);
      } catch (err) {
        console.error("Master sync failed:", err);
        if (err.response?.status === 401) handleLogout();
      }
    };

    window.addEventListener('profileUpdated', fetchFreshData);
    window.addEventListener('storage', syncUser);

    if (currentUser) fetchFreshData();

    return () => {
      window.removeEventListener('profileUpdated', fetchFreshData);
      window.removeEventListener('storage', syncUser);
    };
  }, []); 

  // 👉 UPDATED: Handle Google & Regular Auth Success
  const handleAuthSuccess = (userData) => {
    // If the child component (Landing) sends the data directly, save it
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setCurrentUser(userData.user ? userData.user : userData);
    } else {
      // Fallback for modal which might just trigger a refresh
      const storedData = localStorage.getItem('userInfo');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCurrentUser(parsedData.user ? parsedData.user : parsedData);
      }
    }
  };

  return (
    // 👉 WRAP: Put your Client ID here
    <GoogleOAuthProvider clientId="858783026152-k8q7n8dqeckg5p4hodfaahsk0mut7llj.apps.googleusercontent.com">
      <UserProvider>
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

            <Route path="/launchpad" element={
              <ProtectedLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Launchpad user={currentUser} />
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

            <Route path="/user/:id" element={
              <ProtectedLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Profile user={currentUser} />
              </ProtectedLayout>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;