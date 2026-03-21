import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Grid, List, Filter } from 'lucide-react'
import { useAppStore, useUIStore } from '../store'
import { Button } from '../components/common'
import { AppGrid } from '../components/apps'
import { SearchBar, FilterModal } from '../components/search'
import { CategoryList } from '../components/categories'

const Explore = () => {
  const [searchParams] = useSearchParams()
  const { apps } = useAppStore()
  const { viewMode, setViewMode, filters, modals, openModal, closeModal } = useUIStore()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Search
      const matchesSearch = !searchQuery || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory

      // Language filter
      const matchesLanguage = filters.languages.length === 0 || 
        filters.languages.includes(app.language)

      // Platform filter
      const matchesPlatform = filters.platforms.length === 0 || 
        app.platforms.some(p => filters.platforms.includes(p))

      // Rating filter
      const matchesRating = app.rating >= filters.rating

      // Price filter
      const matchesPrice = filters.priceRange === 'all' ||
        (filters.priceRange === 'free' && app.price === 'Free') ||
        (filters.priceRange === 'paid' && app.price !== 'Free')

      return matchesSearch && matchesCategory && matchesLanguage && 
             matchesPlatform && matchesRating && matchesPrice
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating': return b.rating - a.rating
        case 'newest': return new Date(b.releaseDate) - new Date(a.releaseDate)
        case 'name': return a.name.localeCompare(b.name)
        default: return b.downloads - a.downloads
      }
    })
  }, [apps, searchQuery, selectedCategory, filters])

  const activeFiltersCount = [
    filters.languages.length > 0,
    filters.platforms.length > 0,
    filters.rating > 0,
    filters.priceRange !== 'all',
  ].filter(Boolean).length

  return (
    <div className="page-container">
      <h1 className="title">Explore Apps</h1>

      {/* Search */}
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, description, or tags..."
      />

      {/* Categories */}
      <CategoryList 
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted">
          {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'} found
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            icon={Filter}
            onClick={() => openModal('filter')}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-main text-bg text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
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

      {/* Apps Grid */}
      <AppGrid 
        apps={filteredApps} 
        view={viewMode}
        emptyTitle="No apps found"
        emptyDescription="Try adjusting your search or filters"
      />

      {/* Filter Modal */}
      <FilterModal 
        isOpen={modals.filter}
        onClose={() => closeModal('filter')}
      />
    </div>
  )
}

export default Explore
