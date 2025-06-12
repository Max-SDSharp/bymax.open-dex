import { Draft } from 'immer'

import { createStore } from './store'

/**
 * Theme state management interface
 *
 * @property theme - Current theme ('light' or 'dark')
 * @property setTheme - Function to set a specific theme
 * @property toggleTheme - Function to toggle between light and dark themes
 */
interface ThemeState {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

/**
 * Theme store for managing application theme
 * Uses persistent storage with a unique key 'theme-storage'
 */
export const theme = createStore<ThemeState>(
  (set) => ({
    theme: 'dark',

    /**
     * Sets the application theme and updates DOM accordingly
     *
     * @param theme - The theme to set ('light' or 'dark')
     */
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

    /**
     * Toggles between light and dark themes
     */
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
  }),
  'theme-storage',
)
