import { createStore } from './useStore'
import { Draft } from 'immer'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = createStore<ThemeState>((set) => {
  // Definir o tema padrão como dark
  const defaultTheme: Theme = 'dark'
  
  return {
    theme: defaultTheme,
    
    setTheme: (theme: Theme) => {
      set((state: Draft<ThemeState>) => {
        state.theme = theme
      })
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme)
        
        // Adicionar ou remover a classe 'dark' no elemento html
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    
    toggleTheme: () => {
      set((state: Draft<ThemeState>) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light'
        state.theme = newTheme
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newTheme)
          
          // Adicionar ou remover a classe 'dark' no elemento html
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      })
    }
  }
}) 