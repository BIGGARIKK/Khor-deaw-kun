import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' 
import InputField from '../Component/InputField'
import ButtonLetGo from '../Component/ButtonLetGo'
import { apiRequest } from '../../../service/api' 

import './Signup.css'

function SignUp() {
  const navigate = useNavigate(); 

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const [validation, setValidation] = useState({
    username: null,
    passwordMatch: null,
    email: null,
  });

  const [popup, setPopup] = useState({
    isOpen: false,
    type: '', 
    title: '',
    message: ''
  });

  const closePopup = () => {
    if (popup.type === 'success') {
      navigate('/signin'); 
    } else {
      setPopup({ ...popup, isOpen: false }); 
    }
  };

  useEffect(() => {
    if (username.length === 0) {
      setValidation(prev => ({ ...prev, username: null }));
      return;
    }
    if (username.length < 3) {
      setValidation(prev => ({ ...prev, username: 'invalid' }));
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await apiRequest(`/check-username?username=${username}`, 'GET');
        setValidation(prev => ({ ...prev, username: response.exists ? 'invalid' : 'valid' }));
      } catch (error) {
        setValidation(prev => ({ ...prev, username: 'invalid' }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  // 🌟 อัปเดตระบบเช็ค Password ตอนพิมพ์
  useEffect(() => {
    if (password === '' && confirmPassword === '') {
      setValidation(prev => ({ ...prev, passwordMatch: null })); 
    } else if (password.length > 0 && password.length < 6) {
      setValidation(prev => ({ ...prev, passwordMatch: 'invalid' })); 
    } else if (confirmPassword !== '' && password !== confirmPassword) {
      setValidation(prev => ({ ...prev, passwordMatch: 'invalid' })); 
    } else if (password !== '' && password === confirmPassword && password.length >= 6) {
      setValidation(prev => ({ ...prev, passwordMatch: 'valid' })); 
    } else {
      setValidation(prev => ({ ...prev, passwordMatch: null })); 
    }
  }, [password, confirmPassword]);

  const handleEmailChange = (value) => {
    setEmail(value);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setValidation(prev => ({ ...prev, email: value === '' ? null : (isValidEmail ? 'valid' : 'invalid') }));
  };

  const handlesignup = async (e) => {
    e.preventDefault(); 

    if (!username || !password || !confirmPassword || !email) {
      setPopup({ isOpen: true, type: 'error', title: 'Hold on!', message: 'Please fill in all fields before continuing.' });
      return;
    }
    if (validation.username === 'invalid') {
      setPopup({ isOpen: true, type: 'error', title: 'Invalid Username', message: 'This username is already taken or too short.' });
      return;
    }
    if (validation.email === 'invalid') {
      setPopup({ isOpen: true, type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setPopup({ isOpen: true, type: 'error', title: 'Weak Password', message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      setPopup({ isOpen: true, type: 'error', title: 'Password Mismatch', message: 'Your passwords do not match. Please try again.' });
      return;
    }
    if (!termsAccepted) {
      setPopup({ isOpen: true, type: 'error', title: 'Action Required', message: 'Please agree to our Terms & Conditions and Privacy Policy.' });
      return;
    }

    try {
      const data = await apiRequest('/signup', 'POST', { username, password, email });
      setPopup({ 
        isOpen: true, 
        type: 'success', 
        title: 'Yay! Success!', 
        message: 'Your account has been created successfully.' 
      });
    } catch (error) {
      setPopup({ isOpen: true, type: 'error', title: 'Error!', message: error.message || 'Something went wrong' });
    }
  }

  return (
    <>
      <div className="container-all signup-bg">
        
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

        {/* 🌟 ฝั่งขวา: โซนสมัครสมาชิก (ป้ายไม้) */}
        <div className="sign-section">
          <div className="wood-board-bg">
            <h1 className='board-header'>Sign Up</h1>
            
            <div className="inputbox board-inputs">
              <InputField label="" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} status={validation.username} />
              <InputField label="" type="password" placeholder="Password (Min. 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} status={validation.passwordMatch} />
              <InputField label="" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} status={validation.passwordMatch} />
              <InputField label="" type="email" placeholder="Email" value={email} onChange={(e) => handleEmailChange(e.target.value)} status={validation.email} />
            </div>

            {/* ส่วน Checkbox (เอาเข้ามาอยู่ในป้ายไม้แล้ว) */}
            <label className="terms-container">
              <input type="checkbox" className="hidden-checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span className="custom-checkbox"></span>
              <span className="terms-text">
                I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
              </span>
            </label>
            
            {/* ปุ่ม Let's Go (หุ้มด้วย class ให้จัดกลาง) */}
            <div className="action-section-inside">
              <ButtonLetGo text = "Create Account" disabled={false} onClick={handlesignup} />
            </div>
            
            {/* ข้อความลงชื่อเข้าใช้ (เอาเข้ามาต่อท้ายปุ่มในป้ายไม้) */}
            <div className="bottom-links">
              <span className='have-account'>
                Have an account? <Link to="/signin">Sign in</Link>
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* 🌟 โครงสร้าง HTML ของ Popup เหมือนเดิม */}
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
  )
}

export default SignUp