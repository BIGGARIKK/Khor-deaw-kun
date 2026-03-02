import React from 'react'
import InputField from '../Component/InputField'
import ButtonLetGo from '../Component/ButtonLetGo'
import { Link , useNavigate} from 'react-router-dom' // เหลือแค่ Link ที่จำเป็น
import { apiRequest } from '../../../service/api' // นำเข้า apiRequest จากไฟล์ api.js
import { useState } from 'react'


import './SignIn.css'

function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
      e.preventDefault(); // กันหน้าเว็บรีเฟรชเอง
      
      try {
        // 3. ตรงนี้แหละที่ตัวแปร username ถูกนำมาใช้
        const data = await apiRequest('/signin', 'POST', { username, password });
        console.log('Login Success:', data);
        localStorage.setItem('user', JSON.stringify({ access_token: data.access_token }));
        navigate('/Feed');
      } catch (error) {
        alert(error.message || 'Login Failed!');
      }
    };

  return (
    <>
      <div className="container-all">
        <div className='Icon'>
          <img src="/Mootha.png" alt="Mootha" />
          <svg viewBox="0 0 500 250" className="curved-text-svg">
            <path id="curve" d="M 50,200 A 200,120 0 0 1 450,200" fill="transparent" />
            <text>
              <textPath xlinkHref="#curve" startOffset="50%" textAnchor="middle">
                <tspan fill="#000000" dx="-20">Khor</tspan>
                <tspan fill="#FF9F43" dx="40">Deaw</tspan>
                <tspan fill="#000000" dx="40">Kun</tspan>
              </textPath>
            </text>
          </svg>
        </div>

        <div className="container">
          <h1 className='header'>S i g n I n</h1>
          
          <div className="inputbox">
            <InputField 
                label="Username" 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} // ส่งฟังก์ชันไปอัปเดต State
              />
            <InputField 
              label="Password" 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} // ส่งฟังก์ชันไปอัปเดต State
            />
          </div>

          <div className="signin-options">
            <span className='forgot-password'><a href="/">Forgot Password?</a></span>
          </div>


          <ButtonLetGo disabled={false} onClick={handleLogin} />

          <span className='have-account'>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </span>
        </div>
      </div>
    </>
  )
}

export default SignIn