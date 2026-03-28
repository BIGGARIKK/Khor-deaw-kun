import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../Component/InputField';
import { apiRequest } from '../../../service/api';

import './SignIn.css';

function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);
  
  const [popup, setPopup] = useState({
    isOpen: false,
    type: '', 
    title: '',
    message: ''
  });

  const closePopup = () => {
    if (popup.type === 'success') {
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

  // 🌟 ฟังก์ชันจัดการ Login (ดัก Form Submit)
  const handleLogin = async (e) => {
    e.preventDefault(); // หยุดการรีเฟรชหน้าของ Form 100%

    if (!username || !password) {
      setLoginStatus('invalid');
      setPopup({ isOpen: true, type: 'error', title: 'แจ้งเตือน!', message: 'กรุณากรอก Username และ Password ให้ครบถ้วนครับ' });
      return;
    }

    try {
      const data = await apiRequest('/signin', 'POST', { username, password });
      console.log('Login Success:', data);
      localStorage.setItem('user', JSON.stringify({ access_token: data.access_token }));
      localStorage.setItem('username', data.username); 
      localStorage.setItem('profile_image', data.profile_image);
      
      setLoginStatus('valid');
      setPopup({ isOpen: true, type: 'success', title: 'ยินดีต้อนรับกลับ!', message: 'เข้าสู่ระบบสำเร็จแล้ว ลุยกันเลย 🍻' });

    } catch (error) {
      console.error("Login Error Catch:", error);
      setLoginStatus('invalid');
      setPopup({ isOpen: true, type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: 'Username หรือ Password ไม่ถูกต้อง ลองใหม่อีกครั้งนะครับ 🥲' });
    }
  };

  return (
    <>
      <div className="container-all signin-bg">
        
        {/* ฝั่งซ้าย: โลโก้โค้งๆ */}
        <div className='logo-section'>
          <svg viewBox="0 0 500 300" className="curved-text-svg">
            <defs>
              <linearGradient id="gradKhor" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A4A4A" /><stop offset="100%" stopColor="#1A1A1A" />
              </linearGradient>
              <linearGradient id="gradDeaw" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2980B9" /><stop offset="100%" stopColor="#154360" />
              </linearGradient>
              <linearGradient id="gradKun" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E67E22" /><stop offset="100%" stopColor="#A04000" />
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

        {/* ฝั่งขวา: โซนล็อกอิน */}
        <div className="sign-section">
          <div className="wood-board-bg">
            <h1 className='board-header'>Sign In</h1>
            
            {/* 🌟 ครอบด้วย <form> เพื่อให้ e.preventDefault() ทำงานได้สมบูรณ์ และกด Enter เพื่อล็อกอินได้ */}
            <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div className="inputbox board-inputs" style={{ width: '100%' }}>
                <InputField 
                  label="" type="text" placeholder="Username" 
                  value={username} onChange={handleInputChange(setUsername)} status={loginStatus} 
                />
                <InputField 
                  label="" type="password" placeholder="Password" 
                  value={password} onChange={handleInputChange(setPassword)} status={loginStatus} 
                />
              </div>

              {/* เปลี่ยนเป็น type="submit" เพื่อให้ทำงานคู่กับ form */}
              <div className="action-section-inside" style={{ marginTop: '15px', width: '100%' }}>
                <button 
                  type="submit" 
                  style={{
                    width: '100%', padding: '12px', backgroundColor: '#F48C2A', color: '#1A1A1A',
                    border: '3px solid #3E2723', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold',
                    cursor: 'pointer', boxShadow: '3px 3px 0px #3E2723', fontFamily: 'inherit', transition: 'all 0.1s ease'
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0px 0px 0px #3E2723'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0px #3E2723'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0px #3E2723'; }}
                >
                  Let's Go!
                </button>
              </div>

            </form>

            <div className="bottom-links" style={{ marginTop: '20px' }}>
              <span className='have-account'>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </span>
            </div>

          </div> 
        </div> 
      </div>

      {/* Popup แจ้งเตือน */}
      {popup.isOpen && (
        <div onClick={closePopup} style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
              position: 'relative', backgroundColor: '#5C4033', border: '4px solid #3E2723', borderRadius: '20px', 
              padding: '30px 25px', width: '90%', maxWidth: '350px', boxShadow: '0px 8px 0px #2A1B15', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden',
              fontFamily: "'Schoolbell', 'Playpen Sans Thai', cursive"
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('src/assets/Hub/cartoon-wood-pattern.avif')", backgroundRepeat: 'repeat', backgroundSize: '250px', opacity: 0.35, zIndex: 0, pointerEvents: 'none' }}></div>
            <div style={{ fontSize: '50px', marginBottom: '10px', zIndex: 1 }}>{popup.type === 'success' ? '✅' : '❌'}</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#FFD285', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', zIndex: 1, fontSize: '1.8rem' }}>{popup.title}</h2>
            <p style={{ margin: '5px 0 25px 0', color: 'white', textShadow: '1px 1px 2px #3E2723', fontSize: '1.1rem', lineHeight: '1.5', zIndex: 1 }}>{popup.message}</p>
            <div style={{ width: '100%', zIndex: 1 }}>
              <button onClick={closePopup} style={{
                  width: '100%', padding: '12px', border: '3px solid #3E2723', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '3px 3px 0px #3E2723',
                  backgroundColor: popup.type === 'success' ? '#84E045' : '#FFDEE4', color: popup.type === 'success' ? '#1A1A1A' : '#3E2723', fontFamily: 'inherit', transition: '0.1s'
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0px 0px 0px #3E2723'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0px #3E2723'; }}>
                {popup.type === 'success' ? "Let's Go!" : "ลองใหม่"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SignIn;