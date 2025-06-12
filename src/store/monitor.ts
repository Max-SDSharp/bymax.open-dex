import { Draft } from 'immer'

import { createStore } from './store'

/**
 * Interface representing a monitor data entry
 *
 * @property id - Unique identifier for the monitor
 * @property data - Monitor data payload (can be any structure)
 * @property lastUpdate - Timestamp of last update
 */
export interface MonitorData {
  id: string
  data: any
  lastUpdate: number
}

/**
 * Monitor state management interface
 *
 * @property items - Array of monitor data entries
 * @property addMonitor - Function to add or update a monitor
 * @property removeMonitor - Function to remove a monitor by ID
 * @property clearMonitor - Function to clear all monitor data
 */
interface MonitorState {
  items: MonitorData[]
  addMonitor: (monitor: MonitorData) => void
  removeMonitor: (id: string) => void
  clearMonitor: () => void
}

/**
 * Monitor store for tracking data from various sources
 * Uses persistent storage with a unique key 'monitor-storage'
 */
export const monitor = createStore<MonitorState>(
  (set) => ({
    items: [],

    addMonitor: (monitor) => {
      set((state: Draft<MonitorState>) => {
        const idx = state.items.findIndex(
          (i: MonitorData) => i.id === monitor.id,
        )

        if (idx >= 0) {
          // Update existing monitor data
          state.items[idx] = monitor
        } else {
          // Add new monitor data
          state.items.push(monitor)
        }
      })
    },

    removeMonitor: (id) => {
      set((state: Draft<MonitorState>) => {
        state.items = state.items.filter((m: MonitorData) => m.id !== id)
      })
    },

    clearMonitor: () => {
      set((state: Draft<MonitorState>) => {
        state.items = []
      })
    },
  }),
  'monitor-storage',
)
