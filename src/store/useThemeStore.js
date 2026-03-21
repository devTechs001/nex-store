// src/store/useThemeStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themes = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      '--bg-color': '#1f242d',
      '--sbg-color': '#323946',
      '--text-color': '#fff',
      '--text-muted': '#a0a0a0',
      '--main-color': '#0ef',
      '--alt-color': '#1a2b3c',
      '--ol-color': '#0e1022',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      '--bg-color': '#f5f5f7',
      '--sbg-color': '#ffffff',
      '--text-color': '#1a1a2e',
      '--text-muted': '#6b7280',
      '--main-color': '#0099cc',
      '--alt-color': '#e8f4f8',
      '--ol-color': '#d1d5db',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      '--bg-color': '#0a0e17',
      '--sbg-color': '#141b2d',
      '--text-color': '#e2e8f0',
      '--text-muted': '#64748b',
      '--main-color': '#818cf8',
      '--alt-color': '#1e293b',
      '--ol-color': '#0f172a',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      '--bg-color': '#1a2e1a',
      '--sbg-color': '#2d4a2d',
      '--text-color': '#e8f5e8',
      '--text-muted': '#8fbc8f',
      '--main-color': '#4ade80',
      '--alt-color': '#1f3d1f',
      '--ol-color': '#0d1f0d',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      '--bg-color': '#0c1929',
      '--sbg-color': '#152238',
      '--text-color': '#e0f2fe',
      '--text-muted': '#7dd3fc',
      '--main-color': '#38bdf8',
      '--alt-color': '#1e3a5f',
      '--ol-color': '#0a1628',
    },
  },
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      currentTheme: 'dark',
      themes,

      setTheme: (themeId) => {
        const theme = themes[themeId]
        if (!theme) return

        // Apply CSS variables
        const root = document.documentElement
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })

        // Update Tailwind classes
        document.body.className = themeId === 'light' ? 'light-theme' : ''

        set({ currentTheme: themeId })
      },

      getTheme: () => {
        const { currentTheme } = get()
        return themes[currentTheme] || themes.dark
      },

      getThemes: () => Object.values(themes),
    }),
    {
      name: 'theme-storage',
      onRehydrate: (state) => {
        // Apply saved theme on load
        setTimeout(() => {
          state?.setTheme(state.currentTheme || 'dark')
        }, 0)
      },
    }
  )
)