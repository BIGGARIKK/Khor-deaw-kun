import React from 'react'
import InputField from '../Component/InputField'
import ButtonLetGo from '../Component/ButtonLetGo'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import './Signup.css'

function SignUp() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)


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
          <h1 className='header'>S i g n U p</h1>
          <div className="inputbox">
            <InputField label="Username" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <InputField label="Password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <InputField label="Password" type="password" placeholder="Password Confirm" onChange={(e) => setConfirmPassword(e.target.value)} />
            <InputField label="Email" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <label className="terms-container">
            {/* ตัว input จริงๆ จะถูกซ่อนไว้ด้วย CSS */}
            <input
              type="checkbox"
              className="hidden-checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />

            {/* กล่อง Checkbox ที่เราจะวาดเอง */}
            <span className="custom-checkbox"></span>

            {/* ข้อความเงื่อนไข */}  
            <span className="terms-text">
              I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
            </span>
          </label>
          <ButtonLetGo disabled={!termsAccepted} />
          <span className='have-account'>
            Have an account? <Link to="/signin">Sign in</Link>
          </span>
        </div>
      </div>
    </>

  )
}

export default SignUp