import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignIn from './pages/AuthenPage/SignIn/SignIn'
import SignUp from './pages/AuthenPage/SignUp/SignUp'
import Profile from './pages/profile/profile'
import Feed from './pages/Feed/Feed'
// 1. สร้างหน้า Sign In และ Sign Up
function App() {
  return (
    <BrowserRouter>

      
      <Routes>
        {/* 1. เมื่อเข้าหน้าแรกสุด (/) ให้โยนไปหน้า /Signin */}
        <Route path="/" element={<Navigate to="/Signin" />} />
        
        {/* 2. หน้า Sign In หลัก */}
        <Route path="/Signin" element={<SignIn />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* 3. หน้า Sign Up */}
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/Feed" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App