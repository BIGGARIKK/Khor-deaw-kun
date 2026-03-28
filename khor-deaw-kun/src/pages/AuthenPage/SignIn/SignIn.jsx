import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../Component/InputField';
import ButtonLetGo from '../Component/ButtonLetGo';
import { apiRequest } from '../../../service/api';

import './SignIn.css';

function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);
  
  // 🌟 1. เปลี่ยน state จาก errorMessage เป็น popup แบบ SignUp
  const [popup, setPopup] = useState({
    isOpen: false,
    type: '', 
    title: '',
    message: ''
  });

  // 🌟 2. ฟังก์ชันปิด Popup 
  const closePopup = () => {
    if (popup.type === 'success') {
      // ถ้าเข้าสู่ระบบสำเร็จ พอกดปิด Popup จะพาไปหน้า Feed
      navigate('/beach'); 
    } else {
      setPopup({ ...popup, isOpen: false }); 
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (loginStatus === 'invalid') {
      setLoginStatus(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setLoginStatus('invalid');
      // 🌟 สั่งเปิด Popup แจ้งเตือนเมื่อกรอกไม่ครบ
      setPopup({ isOpen: true, type: 'error', title: 'Hold on!', message: 'Please enter both username and password.' });
      return;
    }

    try {
      const data = await apiRequest('/signin', 'POST', { username, password });
      console.log('Login Success:', data);
      localStorage.setItem('user', JSON.stringify({ access_token: data.access_token }));
      // 🌟 เปลี่ยนมาเซฟใส่คีย์ 'access_token' ตรงๆ ไปเลยครับ
// localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('username', data.username); 
      
      // (เผื่ออยากเก็บรูปไว้ใช้โชว์ตรง Navbar ด้วยก็เก็บได้เลยครับ)
      localStorage.setItem('profile_image', data.profile_image);
      
      setLoginStatus('valid');
      // 🌟 สั่งเปิด Popup เมื่อเข้าสู่ระบบสำเร็จ
      setPopup({ isOpen: true, type: 'success', title: 'Welcome Back!', message: 'You have logged in successfully.' });

    } catch (error) {
      setLoginStatus('invalid');
      // 🌟 สั่งเปิด Popup แจ้งเตือนเมื่อรหัสผิด หรือมี Error
      setPopup({ isOpen: true, type: 'error', title: 'Login Failed', message: error.message || 'Invalid username or password!' });
    }
  };

  return (
    // 🌟 3. ต้องมี <> ... </> ครอบไว้ เพราะเราจะใส่ Popup ไว้ล่างสุด
    <>
      <div className="container-all signin-bg">
        
        {/* 🌟 ฝั่งซ้าย: โลโก้โค้งๆ */}
        <div className='logo-section'>
          <svg viewBox="0 0 500 300" className="curved-text-svg">
            <defs>
              <linearGradient id="gradKhor" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A4A4A" />
                <stop offset="100%" stopColor="#1A1A1A" />
              </linearGradient>
              <linearGradient id="gradDeaw" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2980B9" />
                <stop offset="100%" stopColor="#154360" />
              </linearGradient>
              <linearGradient id="gradKun" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E67E22" />
                <stop offset="100%" stopColor="#A04000" />
              </linearGradient>
            </defs>
            <path id="curve" d="M 50,200 A 200,120 0 0 1 450,200" fill="transparent" />
            <text className="animated-title">
              <textPath xlinkHref="#curve" startOffset="50%" textAnchor="middle">
                <tspan fill="url(#gradKhor)" dx="-20">Khor</tspan>
                <tspan fill="url(#gradDeaw)" dx="40">Deaw</tspan>
                <tspan fill="url(#gradKun)" dx="40">Kun</tspan>
              </textPath>
            </text>
          </svg>
        </div>

        {/* 🌟 ฝั่งขวา: โซนล็อกอิน */}
        <div className="sign-section">
          
          <div className="wood-board-bg">
            <h1 className='board-header'>Sign In</h1>
            
            <div className="inputbox board-inputs">
              <InputField 
                label="" 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={handleInputChange(setUsername)} 
                status={loginStatus} 
              />
              <InputField 
                label="" 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={handleInputChange(setPassword)} 
                status={loginStatus} 
              />
            </div>

            {/* 🌟 (ลบ Error Message แบบตัวอักษรสีแดงออกไปแล้ว) */}

            {/* ลิงก์ Forgot Password อยู่ในป้ายไม้ */}
            <div className="signin-options">
              <span className='forgot-password'>
                <Link to="/forgot-password">Forgot Password?</Link>
              </span>
            </div>

            {/* ปุ่ม Let's Go */}
            <div className="action-section-inside">
              <ButtonLetGo disabled={false} onClick={handleLogin} />
            </div>

            {/* ข้อความ Sign up */}
            <div className="bottom-links">
              <span className='have-account'>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </span>
            </div>

          </div> 
        </div> 
        
      </div>

      {/* 🌟 4. โครงสร้าง HTML ของ Popup ที่จะแสดงเมื่อ popup.isOpen เป็น true */}
      {popup.isOpen && (
        <div className="custom-popup-overlay" onClick={closePopup}>
          <div className="custom-popup-box" onClick={(e) => e.stopPropagation()}>
            
            <div className={`popup-icon-container`}>
              {popup.type === 'success' ? (
                <svg className="modern-svg-icon success-svg" viewBox="0 0 52 52">
                  <circle className="svg-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="svg-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              ) : (
                <svg className="modern-svg-icon error-svg" viewBox="0 0 52 52">
                  <circle className="svg-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="svg-cross" fill="none" d="M16 16 36 36 M36 16 16 36" />
                </svg>
              )}
            </div>

            <h2 className="popup-title">{popup.title}</h2>
            <p className="popup-message">{popup.message}</p>
            <button className="popup-btn" onClick={closePopup}>
              {popup.type === 'success' ? "Let's Go!" : "Try Again"}
            </button>
            
          </div>
        </div>
      )}
    </>
  );
}

export default SignIn;