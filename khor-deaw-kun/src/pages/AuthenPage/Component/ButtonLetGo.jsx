import React from 'react'
import './ButtonLetGo.css'


function ButtonLetGo({ text,disabled, onClick }) {
  return (
    <>
      <button className={disabled ? 'btn-disabled' : 'btn-active'} disabled={disabled} onClick={onClick}>
        {text || "Let's Go!"}
      </button>    </>
  )
}

export default ButtonLetGo