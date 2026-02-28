import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages & Components
import Landing from './pages/Landing'; // 👉 Added Landing
import Feed from './pages/feed'; 
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

// 👉 The Bouncer (ProtectedLayout)
const ProtectedLayout = ({ children, user }) => {
  // 👉 FIX: Agar bina login koi andar aane ki koshish kare, toh use Landing page ('/') par bhejo
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1265px] flex justify-between">
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={user} />
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

  // 👉 THE MASTER FIX: Walkie-Talkie Receiver (Safe & Intact)
  useEffect(() => {
    const syncUser = () => {
      const storedData = localStorage.getItem('userInfo');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCurrentUser(parsedData.user ? parsedData.user : parsedData);
      } else {
        // Agar local storage khali ho jaye (eg. Logout), toh state null karo
        setCurrentUser(null);
      }
    };

    window.addEventListener('profileUpdated', syncUser);
    
    // Custom event dispatch for logout synchronization
    window.addEventListener('storage', syncUser); // Catches localStorage changes from other tabs

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
        {/* 🌟 THE ONLY PUBLIC ENTRY POINT (Landing Page + Popup Modal) 🌟 */}
        <Route path="/" element={
          currentUser ? <Navigate to="/feed" replace /> : <Landing onAuthSuccess={handleAuthSuccess} />
        } />
        
        {/* ❌ /login aur /register hata diye gaye hain kyunki wo ab Landing page ke Modal me hain */}
        
        {/* 👑 PROTECTED ROUTES */}
        <Route path="/feed" element={
          <ProtectedLayout user={currentUser}>
            <Feed user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="/notifications" element={
          <ProtectedLayout user={currentUser}>
            <Notifications user={currentUser} />
          </ProtectedLayout>
        } />
        
        <Route path="/profile" element={
          <ProtectedLayout user={currentUser}>
            <Profile user={currentUser} />
          </ProtectedLayout>
        } />
        
        {/* Fallback route: Agar koi random URL ho toh main page par le aao */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;