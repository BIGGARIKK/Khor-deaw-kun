import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import Pages
import SignIn from './pages/AuthenPage/SignIn/SignIn';
import SignUp from './pages/AuthenPage/SignUp/SignUp';
import Profile from './pages/profile/profile';
import Feed from './pages/Feed/Feed';
import Hub from './pages/Hub/Hub';
import GrillRoom from './pages/Mookata/GrillRoom';

import Settings from './pages/Feed/component/feed/Setting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Signin" />} />
        
        <Route path="/Signin" element={<SignIn />} />
        <Route path="/Signup" element={<SignUp />} />
        
        {/* 🌟 1. หน้า Profile ของเราเอง (ดึงจาก LocalStorage) */}
        <Route path="/profile" element={<Profile />} />
        
        {/* 🌟 2. เพิ่มบรรทัดนี้! สำหรับไปดูหน้า Profile คนอื่นตามชื่อ username ใน URL */}
        <Route path="/profile/:username" element={<Profile />} />
        
        <Route path="/settings" element={<Settings />} />

        <Route path="/Beach" element={<Feed />} />
        <Route path="/Hub" element={<Hub />} />
        <Route path="/Mookata" element={<GrillRoom />} />
        <Route path="/room/:roomId" element={<GrillRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;