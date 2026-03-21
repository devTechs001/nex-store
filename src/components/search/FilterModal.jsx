// src/components/search/FilterModal.jsx
import React, { useState } from 'react'
import { Modal, Button, Badge } from '../common'
import { LANGUAGES } from '../../data/languages'
import { PLATFORMS } from '../../data/platforms'
import { useUIStore } from '../../store'

const FilterModal = ({ isOpen, onClose }) => {
  const { filters, setFilters, resetFilters } = useUIStore()
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    setFilters(localFilters)
    onClose()
  }

  const handleReset = () => {
    resetFilters()
    setLocalFilters({
      languages: [],
      platforms: [],
      rating: 0,
      sortBy: 'popular',
      priceRange: 'all',
    })
  }

  const toggleLanguage = (langId) => {
    const newLangs = localFilters.languages.includes(langId)
      ? localFilters.languages.filter(l => l !== langId)
      : [...localFilters.languages, langId]
    setLocalFilters({ ...localFilters, languages: newLangs })
  }

  const togglePlatform = (platformId) => {
    const newPlatforms = localFilters.platforms.includes(platformId)
      ? localFilters.platforms.filter(p => p !== platformId)
      : [...localFilters.platforms, platformId]
    setLocalFilters({ ...localFilters, platforms: newPlatforms })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" size="md">
      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Sort By</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'popular', label: 'Most Popular' },
              { id: 'rating', label: 'Highest Rated' },
              { id: 'newest', label: 'Newest' },
              { id: 'name', label: 'Name A-Z' },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: option.id })}
                className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.sortBy === option.id
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Price</h3>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'free', label: 'Free' },
              { id: 'paid', label: 'Paid' },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setLocalFilters({ ...localFilters, priceRange: option.id })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.priceRange === option.id
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => toggleLanguage(lang.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.languages.includes(lang.id)
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {lang.icon} {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.platforms.includes(platform.id)
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {platform.icon} {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Minimum Rating</h3>
          <div className="flex gap-2">
            {[0, 3, 3.5, 4, 4.5].map(rating => (
              <button
                key={rating}
                onClick={() => setLocalFilters({ ...localFilters, rating })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.rating === rating
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {rating === 0 ? 'Any' : `${rating}+`} ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="ghost" onClick={handleReset} fullWidth>
            Reset All
          </Button>
          <Button variant="primary" onClick={handleApply} fullWidth>
            Apply Filters
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default FilterModal