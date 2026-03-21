// src/pages/Search.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Grid, List, Filter, X } from 'lucide-react'
import { useAppStore, useUIStore } from '../store'
import { Button, Badge } from '../components/common'
import { AppGrid } from '../components/apps'
import { SearchBar, FilterModal } from '../components/search'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { apps, addToSearchHistory } = useAppStore()
  const { viewMode, setViewMode, filters, modals, openModal, closeModal } = useUIStore()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      addToSearchHistory(query)
    }
  }, [searchParams])

  const handleSearch = (query) => {
    setSearchParams(query ? { q: query } : {})
  }

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return []

    return apps.filter(app => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.developer.toLowerCase().includes(query) ||
        app.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        app.language.toLowerCase().includes(query)

      const matchesLanguage = filters.languages.length === 0 || 
        filters.languages.includes(app.language)
      const matchesPlatform = filters.platforms.length === 0 || 
        app.platforms.some(p => filters.platforms.includes(p))
      const matchesRating = app.rating >= filters.rating

      return matchesSearch && matchesLanguage && matchesPlatform && matchesRating
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating': return b.rating - a.rating
        case 'newest': return new Date(b.releaseDate) - new Date(a.releaseDate)
        case 'name': return a.name.localeCompare(b.name)
        default: return b.downloads - a.downloads
      }
    })
  }, [apps, searchQuery, filters])

  const activeFiltersCount = [
    filters.languages.length > 0,
    filters.platforms.length > 0,
    filters.rating > 0,
  ].filter(Boolean).length

  return (
    <div className="page-container">
      <h1 className="title">Search</h1>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearch}
        autoFocus
        showHistory
        showTrending
      />

      {searchQuery && (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-text-muted">
                {filteredApps.length} results for "{searchQuery}"
              </p>
              {activeFiltersCount > 0 && (
                <Badge variant="primary">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                icon={Filter}
                onClick={() => openModal('filter')}
              >
                Filters
              </Button>
              <div className="flex items-center border border-bg-secondary rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-main text-bg' : 'hover:bg-bg-secondary'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-main text-bg' : 'hover:bg-bg-secondary'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <AppGrid 
            apps={filteredApps} 
            view={viewMode}
            emptyTitle="No results found"
            emptyDescription="Try different keywords or adjust your filters"
          />
        </>
      )}

      {!searchQuery && (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-semibold mb-2">Start Searching</h2>
          <p className="text-text-muted">
            Find apps by name, description, developer, or tags
          </p>
        </div>
      )}

      <FilterModal 
        isOpen={modals.filter}
        onClose={() => closeModal('filter')}
      />
    </div>
  )
}

export default Search