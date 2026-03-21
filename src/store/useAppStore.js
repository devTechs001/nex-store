// src/store/useAppStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_APPS } from '../data/mockApps'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Apps
      apps: MOCK_APPS,
      
      // Downloads
      downloads: [],
      addToDownloads: (app) => {
        const { downloads } = get()
        if (!downloads.some(d => d.id === app.id)) {
          set({ 
            downloads: [...downloads, { ...app, downloadDate: new Date().toISOString() }] 
          })
          return true
        }
        return false
      },
      removeFromDownloads: (appId) => {
        set({ downloads: get().downloads.filter(d => d.id !== appId) })
      },
      isDownloaded: (appId) => get().downloads.some(d => d.id === appId),

      // Favorites
      favorites: [],
      toggleFavorite: (app) => {
        const { favorites } = get()
        const isFavorite = favorites.some(f => f.id === app.id)
        if (isFavorite) {
          set({ favorites: favorites.filter(f => f.id !== app.id) })
        } else {
          set({ favorites: [...favorites, app] })
        }
        return !isFavorite
      },
      isFavorite: (appId) => get().favorites.some(f => f.id === appId),

      // Collections
      collections: [
        { id: 1, name: 'My Favorites', apps: [], isDefault: true },
        { id: 2, name: 'Work Tools', apps: [], isDefault: false },
      ],
      createCollection: (name) => {
        const { collections } = get()
        const newCollection = {
          id: Date.now(),
          name,
          apps: [],
          isDefault: false,
          createdAt: new Date().toISOString(),
        }
        set({ collections: [...collections, newCollection] })
        return newCollection
      },
      deleteCollection: (collectionId) => {
        set({ 
          collections: get().collections.filter(c => c.id !== collectionId && !c.isDefault) 
        })
      },
      addToCollection: (collectionId, app) => {
        const { collections } = get()
        set({
          collections: collections.map(c => 
            c.id === collectionId && !c.apps.some(a => a.id === app.id)
              ? { ...c, apps: [...c.apps, app] }
              : c
          )
        })
      },
      removeFromCollection: (collectionId, appId) => {
        const { collections } = get()
        set({
          collections: collections.map(c =>
            c.id === collectionId
              ? { ...c, apps: c.apps.filter(a => a.id !== appId) }
              : c
          )
        })
      },

      // Upload App
      uploadApp: (appData) => {
        const { apps } = get()
        const newApp = {
          ...appData,
          id: Date.now(),
          downloads: 0,
          rating: 0,
          reviews: 0,
          isNew: true,
          isFeatured: false,
          isVerified: false,
          releaseDate: new Date().toISOString().split('T')[0],
          lastUpdate: new Date().toISOString().split('T')[0],
        }
        set({ apps: [newApp, ...apps] })
        return newApp
      },

      // Search History
      searchHistory: [],
      addToSearchHistory: (query) => {
        const { searchHistory } = get()
        const filtered = searchHistory.filter(q => q !== query)
        set({ searchHistory: [query, ...filtered].slice(0, 10) })
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'app-store-storage',
      partialize: (state) => ({
        downloads: state.downloads,
        favorites: state.favorites,
        collections: state.collections,
        searchHistory: state.searchHistory,
      }),
    }
  )
)