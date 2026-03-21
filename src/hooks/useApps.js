// src/hooks/useApps.js
import { useMemo } from 'react'
import { useAppStore } from '../store'

export const useApps = (options = {}) => {
  const { apps } = useAppStore()
  const { 
    category, 
    language, 
    platform, 
    search, 
    sortBy = 'popular',
    limit,
    featured,
    isNew,
  } = options

  const filteredApps = useMemo(() => {
    let result = [...apps]

    // Filter by category
    if (category && category !== 'all') {
      result = result.filter(app => app.category === category)
    }

    // Filter by language
    if (language) {
      result = result.filter(app => app.language === language)
    }

    // Filter by platform
    if (platform) {
      result = result.filter(app => app.platforms.includes(platform))
    }

    // Search
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter featured
    if (featured !== undefined) {
      result = result.filter(app => app.isFeatured === featured)
    }

    // Filter new
    if (isNew !== undefined) {
      result = result.filter(app => app.isNew === isNew)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'downloads':
      case 'popular':
      default:
        result.sort((a, b) => b.downloads - a.downloads)
        break
    }

    // Limit
    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }, [apps, category, language, platform, search, sortBy, limit, featured, isNew])

  return {
    apps: filteredApps,
    total: filteredApps.length,
    isEmpty: filteredApps.length === 0,
  }
}

export default useApps