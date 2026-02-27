import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Notifications from './pages/Notifications'; // Path sahi check karein

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Protected Routes (Aap login ke baad yahan navigate karte ho) */}
        <Route path="/feed" element={<Feed />} />
        <Route path="/notifications" element={<Notifications />} /> 
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;