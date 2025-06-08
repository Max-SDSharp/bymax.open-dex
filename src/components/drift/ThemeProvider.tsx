'use client'

import { useEffect } from 'react'

import { useThemeStore } from '@/store/useThemeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { setTheme } = useThemeStore()

  // Apply theme when component is mounted
  useEffect(() => {
    // Set initial theme
    const savedTheme =
      (localStorage.getItem('theme') as 'light' | 'dark') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')

    setTheme(savedTheme)

    // Add script to avoid theme flash during loading
    const script = document.createElement('script')
    script.innerHTML = `
      (function() {
        try {
          const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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
    }
  }, [setTheme])

  return children
}
