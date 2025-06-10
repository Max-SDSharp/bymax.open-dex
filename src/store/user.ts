import { Draft } from 'immer'

import { createStore } from './store'

export interface UserData {
  id: string
  data: any
  lastUpdate: number
}

interface UserState {
  items: UserData[]
  addUser: (user: UserData) => void
  removeUser: (id: string) => void
  clearUser: () => void
}

export const user = createStore<UserState>((set) => ({
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
}))
