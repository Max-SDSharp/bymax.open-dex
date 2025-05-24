'use client'

import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { setTheme } = useThemeStore()
  
  // Aplicar o tema quando o componente é montado
  useEffect(() => {
    // Definir tema inicial
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    
    setTheme(savedTheme)
    
    // Adiciona script para evitar flash de tema incorreto durante o carregamento
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