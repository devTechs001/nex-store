// src/pages/Category.jsx
import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Grid, List, Filter } from 'lucide-react'
import { useAppStore, useUIStore } from '../store'
import { Button } from '../components/common'
import { AppGrid } from '../components/apps'
import { FilterModal } from '../components/search'
import { getCategoryBySlug, CATEGORIES } from '../data/categories'

const Category = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { apps } = useAppStore()
  const { viewMode, setViewMode, filters, modals, openModal, closeModal } = useUIStore()

  const category = getCategoryBySlug(slug)

  const categoryApps = useMemo(() => {
    if (!category) return []
    return apps
      .filter(app => category.id === 'all' || app.category === category.id)
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating': return b.rating - a.rating
          case 'newest': return new Date(b.releaseDate) - new Date(a.releaseDate)
          case 'name': return a.name.localeCompare(b.name)
          default: return b.downloads - a.downloads
        }
      })
  }, [apps, category, filters.sortBy])

  if (!category) {
    return (
      <div className="page-container text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Button variant="primary" onClick={() => navigate('/explore')}>
          Explore Apps
        </Button>
      </div>
    )
  }

  const CategoryIcon = category.icon

  return (
    <div className="page-container">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-main transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="card mb-8 bg-gradient-to-r from-bg-secondary to-bg">
        <div className="flex items-center gap-6">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <CategoryIcon className="w-10 h-10" style={{ color: category.color }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{category.name}</h1>
            <p className="text-text-muted">
              {categoryApps.length} {categoryApps.length === 1 ? 'app' : 'apps'} available
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-text-muted">{categoryApps.length} apps</p>
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

      {/* Apps */}
      <AppGrid 
        apps={categoryApps} 
        view={viewMode}
        emptyTitle={`No ${category.name.toLowerCase()} found`}
        emptyDescription="Check back later for new apps"
      />

      <FilterModal 
        isOpen={modals.filter}
        onClose={() => closeModal('filter')}
      />
    </div>
  )
}

export default Category