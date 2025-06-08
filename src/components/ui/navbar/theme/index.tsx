'use client'

import { BsSun, BsMoon } from 'react-icons/bs'

import { useThemeStore } from '@/store/useThemeStore'

export default function NavbarTheme() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="flex items-center justify-end">
      <button
        onClick={toggleTheme}
        className="p-2 hover:bg-transparent focus:outline-none"
        aria-label="Toggle theme"
        title={
          theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
        }
      >
        {theme === 'light' ? (
          <BsMoon className="mt-1" size="17px" />
        ) : (
          <BsSun className="mt-1" size="17px" />
        )}
      </button>
    </div>
  )
}
