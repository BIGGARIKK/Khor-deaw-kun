import React from 'react'
import InputField from '../Component/InputField'
import ButtonLetGo from '../Component/ButtonLetGo'
import { useState } from 'react'

import './SignIn.css'

function SignIn() {
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
          <InputField label="Username" type="text" placeholder="Username" />
          <InputField label="Password" type="password" placeholder="Password" />
        </div>
        <span className='forgot-password'><a href="/">Forgot Password?</a></span>
        <ButtonLetGo />
        <span className='have-account'>Don't have an account? <a href="/">Sign up</a></span>
      </div>
      </div>
    </>

  )
}

export default SignIn