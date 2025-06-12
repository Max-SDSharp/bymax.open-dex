import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * Factory function to create a Zustand store with common middleware
 *
 * @template T - The type of state managed by the store
 * @param initializer - Function that initializes the store state and actions
 * @param storeName - Unique name for persistent storage (defaults to 'storage')
 * @returns A configured Zustand store with devtools, persistence, and immer middleware
 */
export const createStore = <T extends object>(
  initializer: (set: any, get: any, store: any) => T,
  storeName: string = 'storage',
) => {
  return create<T>()(
    devtools(
      persist(immer(initializer), {
        name: storeName,
      }),
    ),
  )
}
