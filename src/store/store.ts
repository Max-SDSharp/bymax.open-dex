import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Create a base store creator with common middleware
export const createStore = <T extends object>(
  initializer: (set: any, get: any, store: any) => T,
) => {
  return create<T>()(
    devtools(
      persist(immer(initializer), {
        name: 'bymax-opendex-storage',
      }),
    ),
  )
}
