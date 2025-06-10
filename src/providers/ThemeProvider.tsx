'use client'

import { ReactNode, useEffect } from 'react'

import { theme } from '@/store/theme'

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { setTheme } = theme()

  // Apply theme when component is mounted
  useEffect(() => {
    // Function to get system theme preference
    const getSystemTheme = () => {
      if (typeof window === 'undefined') return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    // Function to handle system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      if (!localStorage.getItem('theme')) {
        setTheme(newTheme)
      }
    }

    // Set initial theme
    const savedTheme = localStorage.getItem('theme')
    const initialTheme = savedTheme || getSystemTheme()
    setTheme(initialTheme as 'light' | 'dark')

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // Add script to avoid theme flash during loading
    const script = document.createElement('script')
    script.innerHTML = `
      (function() {
        try {
          const savedTheme = localStorage.getItem('theme');
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const theme = savedTheme || systemTheme;
          
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {}
      })();
    `
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [setTheme])

  return <>{children}</>
}
