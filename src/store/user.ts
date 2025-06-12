import { Draft } from 'immer'

import { createStore } from './store'

/**
 * Interface representing a user data entry
 *
 * @property id - Unique identifier for the user
 * @property data - User data payload (can be any structure)
 * @property lastUpdate - Timestamp of last update
 */
export interface UserData {
  id: string
  data: any
  lastUpdate: number
}

/**
 * User state management interface
 *
 * @property items - Array of user data entries
 * @property addUser - Function to add or update a user
 * @property removeUser - Function to remove a user by ID
 * @property clearUser - Function to clear all user data
 */
interface UserState {
  items: UserData[]
  addUser: (user: UserData) => void
  removeUser: (id: string) => void
  clearUser: () => void
}

/**
 * User store for managing user data
 * Uses persistent storage with a unique key 'user-storage'
 */
export const user = createStore<UserState>(
  (set) => ({
    items: [],

    addUser: (user) => {
      set((state: Draft<UserState>) => {
        const idx = state.items.findIndex((i: UserData) => i.id === user.id)

        if (idx >= 0) {
          // Update existing user
          state.items[idx] = user
        } else {
          // Add new user
          state.items.push(user)
        }
      })
    },

    removeUser: (id) => {
      set((state: Draft<UserState>) => {
        state.items = state.items.filter((u: UserData) => u.id !== id)
      })
    },

    clearUser: () => {
      set((state: Draft<UserState>) => {
        state.items = []
      })
    },
  }),
  'user-storage',
)
