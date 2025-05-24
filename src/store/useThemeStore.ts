import { Draft } from 'immer'

import { createStore } from './useStore'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = createStore<ThemeState>((set) => {
  // Set default theme to dark
  const defaultTheme: Theme = 'dark'

  return {
    theme: defaultTheme,

    setTheme: (theme: Theme) => {
      set((state: Draft<ThemeState>) => {
        state.theme = theme
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme)

        // Add or remove 'dark' class on html element
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

          // Add or remove 'dark' class on html element
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      })
    },
  }
})
