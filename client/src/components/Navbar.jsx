import React from 'react'
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <div className='navbar'>
      <div className='navbar-logo'>
      </div>
      <ul className='navbar-menu'>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/login">Log In</NavLink></li>
      </ul>
    </div>
  )
}

export default Navbar