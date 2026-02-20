import React from 'react'
import './ButtonLetGo.css'


function ButtonLetGo({ disabled }) {
  return (
    <>
      <button className={disabled ? 'btn-disabled' : 'btn-active'} disabled={disabled}>
        Let's Go &rarr;
      </button>    </>
  )
}

export default ButtonLetGo