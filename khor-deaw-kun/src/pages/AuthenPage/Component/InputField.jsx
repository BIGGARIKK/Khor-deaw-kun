import React from 'react'
import { useState } from 'react'
import './InputField.css'

function InputField({type , placeholder , onChange ,  value}) {
  return (
    <div className="input-field">
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

export default InputField