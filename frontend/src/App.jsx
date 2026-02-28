import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages & Components
import Landing from './pages/Landing'; 
import Feed from './pages/feed'; // Ensure case matches your folder (Feed vs feed)
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

// 👉 The Bouncer (ProtectedLayout) - Ab ye onLogout bhi lega
const ProtectedLayout = ({ children, user, onLogout }) => {
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1265px] flex justify-between">
        <div className="w-[80px] xl:w-[275px]">
          {/* 👉 Sidebar ko onLogout pass kiya */}
          <Sidebar user={user} onLogout={onLogout} />
        </div>
        <main className="w-full max-w-[600px] border-x border-gray-800/60 min-h-screen">
          {children}
        </main>
        <div className="hidden lg:block w-[350px] pl-8 py-3"></div>
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
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null; 
  });

  // 👉 MASTER LOGOUT: Isse state null hogi aur App redirect karega
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
        
        {/* 👑 PROTECTED ROUTES - handleLogout pass karna zaroori hai */}
        <Route path="/feed" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout}>
            <Feed user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="/notifications" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout}>
            <Notifications user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="/profile" element={
          <ProtectedLayout user={currentUser} onLogout={handleLogout}>
            <Profile user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;