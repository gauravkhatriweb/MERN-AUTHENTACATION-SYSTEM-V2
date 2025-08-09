import React from 'react'
import assets from '../assets/assets'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <img src={assets.logo} alt="logo" className='w-28 sm:w-32' />
      <button className='bg-[#007bff] text-white px-4 py-2 rounded-md hover:bg-[#0056b3] transition-colors'>Login</button>
    </nav>
  )
}

export default Navbar