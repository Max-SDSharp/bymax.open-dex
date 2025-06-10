'use client'

import React from 'react'

import { FaMoon, FaSun } from 'react-icons/fa'

import { theme } from '@/store/theme'

const NavbarTheme: React.FC = () => {
  const { theme: currentTheme, toggleTheme } = theme()

  return (
    <div className="flex items-center justify-end">
      <button
        onClick={toggleTheme}
        className="p-2 hover:bg-transparent focus:outline-none"
        aria-label="Toggle theme"
        title={
          currentTheme === 'dark'
            ? 'Switch to light theme'
            : 'Switch to dark theme'
        }
      >
        {currentTheme === 'dark' ? (
          <FaSun className="mt-1" size="17px" />
        ) : (
          <FaMoon className="mt-1" size="17px" />
        )}
      </button>
    </div>
  )
}

export default NavbarTheme
