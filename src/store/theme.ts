import { Draft } from 'immer'

import { createStore } from './store'

interface ThemeState {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const theme = createStore<ThemeState>((set) => ({
  theme: 'dark',

  setTheme: (theme) => {
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
}))
