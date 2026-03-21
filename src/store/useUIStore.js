// src/store/useUIStore.js
import { create } from 'zustand'

export const useUIStore = create((set) => ({
  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  // View Mode
  viewMode: 'grid', // 'grid' | 'list'
  setViewMode: (mode) => set({ viewMode: mode }),

  // Filters
  filters: {
    languages: [],
    platforms: [],
    rating: 0,
    sortBy: 'popular',
    priceRange: 'all',
  },
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({
    filters: {
      languages: [],
      platforms: [],
      rating: 0,
      sortBy: 'popular',
      priceRange: 'all',
    }
  }),

  // Modals
  modals: {
    upload: false,
    filter: false,
    login: false,
    register: false,
  },
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  closeAllModals: () => set({
    modals: { upload: false, filter: false, login: false, register: false }
  }),
}))