import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 👉 FIX: useState ke sath useEffect bhi import karna zaroori hai
import { useState, useEffect } from 'react';

// Pages & Components
import Login from './pages/Login';
import Feed from './pages/feed'; 
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

// 👉 The Bouncer (ProtectedLayout)
const ProtectedLayout = ({ children, user }) => {
  if (!user) return <Navigate to="/login" replace />;

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

  // 👉 THE MASTER FIX: Walkie-Talkie Receiver!
  // Jaise hi Profile.jsx bolega 'profileUpdated', ye function chalega aur Sidebar ki photo badal dega
  useEffect(() => {
    const syncUser = () => {
      const storedData = localStorage.getItem('userInfo');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCurrentUser(parsedData.user ? parsedData.user : parsedData);
      }
    };

    // Signal ka wait karo
    window.addEventListener('profileUpdated', syncUser);
    
    // Cleanup
    return () => window.removeEventListener('profileUpdated', syncUser);
  }, []);

  const handleLoginSuccess = () => {
    const storedData = localStorage.getItem('userInfo');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setCurrentUser(parsedData.user ? parsedData.user : parsedData);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
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
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Router>
  );
}

export default App;