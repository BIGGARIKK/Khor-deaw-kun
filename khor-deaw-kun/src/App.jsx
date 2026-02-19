import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom' // เพิ่มบรรทัดนี้ครับ
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignIn from './pages/AuthenPage/SignIn/SignIn'
import SignUp from './pages/AuthenPage/SignUp/SignUp'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">หน้าหลัก</Link> | <Link to="/Signin">เข้าสู่ระบบ</Link>
      </nav>

      <Routes>

        <Route path="/Signin" element={<SignIn />} />
        <Route path="/Signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App