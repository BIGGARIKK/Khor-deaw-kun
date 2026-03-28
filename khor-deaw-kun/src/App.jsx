import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import Pages
import SignIn from './pages/AuthenPage/SignIn/SignIn';
import SignUp from './pages/AuthenPage/SignUp/SignUp';
import Profile from './pages/profile/profile';
import Feed from './pages/Feed/Feed';
import Hub from './pages/Hub/Hub';
import GrillRoom from './pages/Mookata/GrillRoom';

// ⚙️ เพิ่มการ Import หน้า Settings (เช็ค Path ไฟล์ให้ตรงกับที่บันทึกไว้นะครับ)
import Settings from './pages/Feed/component/feed/Setting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. เมื่อเข้าหน้าแรกสุด (/) ให้โยนไปหน้า /Signin */}
        <Route path="/" element={<Navigate to="/Signin" />} />
        
        {/* 2. หน้า Authentication */}
        <Route path="/Signin" element={<SignIn />} />
        <Route path="/Signup" element={<SignUp />} />
        
        {/* 3. หน้า Profile และ Settings */}
        <Route path="/profile" element={<Profile />} />
        
        {/* ⚙️ เพิ่ม Route สำหรับหน้าตั้งค่าตรงนี้ครับ */}
        <Route path="/settings" element={<Settings />} />

        {/* 4. หน้า Content อื่นๆ */}
        <Route path="/Beach" element={<Feed />} />
        <Route path="/Hub" element={<Hub />} />
        <Route path="/Mookata" element={<GrillRoom />} />
        <Route path="/room/:roomId" element={<GrillRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;