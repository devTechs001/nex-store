// src/store/useAuthStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (userData) => {
        set({
          user: userData,
          isAuthenticated: true,
          isAdmin: userData.role === 'admin',
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        })
      },

      updateProfile: (updates) => {
        const { user } = get()
        set({ user: { ...user, ...updates } })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)