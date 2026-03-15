import React from 'react'
import './InputField.css'

// เพิ่ม status เข้ามาใน Props
function InputField({ type, placeholder, onChange, value, status }) {
  return (
    <div className="input-field-container">
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className={`input-control ${status}`} // ใส่ class ตามสถานะ
      />
      
      {/* ส่วนแสดงไอคอนตามสถานะ */}
      <div className="status-icon-container">
        {status === 'valid' && (
          <svg className="icon-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13L9 17L19 7" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {status === 'invalid' && (
          <svg className="icon-error" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  )
}

export default InputField