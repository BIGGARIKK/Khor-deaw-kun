import React from 'react'
import './ButtonLetGo.css'


function ButtonLetGo({ disabled, onClick }) {
  return (
    <>
      <button className={disabled ? 'btn-disabled' : 'btn-active'} disabled={disabled} onClick={onClick}>
        Let's Go &rarr;
      </button>    </>
  )
}

export default ButtonLetGo