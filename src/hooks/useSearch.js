// src/hooks/useSearch.js
import { useState, useMemo } from 'react'

const useSearch = (items, options = {}) => {
  const {
    searchQuery = '',
    filters = {},
    sortBy = 'relevance',
  } = options

  const [query, setQuery] = useState(searchQuery)

  const filteredItems = useMemo(() => {
    let result = [...items]

    // Search filter
    if (query) {
      const searchLower = query.toLowerCase()
      result = result.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category)
    }

    // Language filter
    if (filters.language) {
      result = result.filter(item => item.language === filters.language)
    }

    // Platform filter
    if (filters.platform) {
      result = result.filter(item =>
        item.platforms?.includes(filters.platform)
      )
    }

    // Rating filter
    if (filters.minRating) {
      result = result.filter(item => item.rating >= filters.minRating)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
        break
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'downloads':
      default:
        result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        break
    }

    return result
  }, [items, query, filters, sortBy])

  return {
    query,
    setQuery,
    results: filteredItems,
    total: filteredItems.length,
    isEmpty: filteredItems.length === 0,
  }
}

export default useSearch
