// src/hooks/useFavorites.js
import { useState } from 'react'
import { useAppStore } from '../store'

const useFavorites = () => {
  const { favorites, addToFavorites } = useAppStore()
  const [filter, setFilter] = useState('all')

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.category === filter)

  const isFavorite = (appId) => {
    return favorites.some(f => f.id === appId)
  }

  const toggleFavorite = (app) => {
    addToFavorites(app)
  }

  const getFavorite = (appId) => {
    return favorites.find(f => f.id === appId)
  }

  const getCount = () => {
    return favorites.length
  }

  return {
    favorites: filteredFavorites,
    allFavorites: favorites,
    filter,
    setFilter,
    isFavorite,
    toggleFavorite,
    getFavorite,
    getCount,
  }
}

export default useFavorites
