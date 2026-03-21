// src/pages/Favorites.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Grid, List, Search, Trash2 } from 'lucide-react'
import { useAppStore } from '../store'
import { useToast } from '../context/ToastContext'
import { Button, EmptyState, Input } from '../components/common'
import { AppGrid } from '../components/apps'

const Favorites = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { favorites, toggleFavorite } = useAppStore()
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const handleClearAll = () => {
    favorites.forEach(app => toggleFavorite(app))
    toast.info('All favorites cleared')
  }

  const filteredFavorites = favorites.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (favorites.length === 0) {
    return (
      <div className="page-container">
        <h1 className="title">Favorites</h1>
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Save apps you love by tapping the heart icon"
          action={() => navigate('/explore')}
          actionLabel="Explore Apps"
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="title">Favorites</h1>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          icon={Search}
          placeholder="Search favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="sm:max-w-xs"
        />
        <div className="flex gap-2">
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
          <Button variant="danger" icon={Trash2} onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Count */}
      <p className="text-text-muted">
        {filteredFavorites.length} {filteredFavorites.length === 1 ? 'app' : 'apps'} saved
      </p>

      {/* Grid */}
      <AppGrid 
        apps={filteredFavorites} 
        view={viewMode}
        emptyTitle="No favorites match your search"
        emptyDescription="Try a different search term"
      />
    </div>
  )
}

export default Favorites