// src/components/apps/AppCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Check, Heart, Star, Shield } from 'lucide-react'
import { useAppStore } from '../../store'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Rating } from '../common'
import { CATEGORIES, getCategoryById } from '../../data/categories'
import { LANGUAGES, getLanguageById } from '../../data/languages'
import { formatNumber } from '../../utils/formatters'

const AppCard = ({ app, view = 'grid' }) => {
  const navigate = useNavigate()
  const { addToDownloads, isDownloaded, toggleFavorite, isFavorite } = useAppStore()
  const toast = useToast()
  
  const downloaded = isDownloaded(app.id)
  const favorited = isFavorite(app.id)
  const category = getCategoryById(app.category)
  const language = getLanguageById(app.language)

  const handleDownload = (e) => {
    e.stopPropagation()
    if (!downloaded) {
      const success = addToDownloads(app)
      if (success) {
        toast.success(`${app.name} downloaded successfully!`)
      }
    }
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    const added = toggleFavorite(app)
    toast.success(added ? `Added to favorites` : `Removed from favorites`)
  }

  const handleClick = () => {
    navigate(`/app/${app.id}`)
  }

  if (view === 'list') {
    return (
      <div
        onClick={handleClick}
        className="card card-hover flex items-center gap-4 cursor-pointer"
      >
        <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-text truncate">{app.name}</h3>
            {app.isVerified && <Shield className="w-4 h-4 text-main" />}
            {app.isNew && <Badge variant="success" size="xs">NEW</Badge>}
          </div>
          <p className="text-sm text-text-muted truncate">{app.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <Rating value={app.rating} size="sm" />
            <span className="text-sm text-text-muted">{formatNumber(app.downloads)} downloads</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              favorited ? 'text-red-500' : 'text-text-muted hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
          <Button
            variant={downloaded ? 'secondary' : 'primary'}
            size="sm"
            icon={downloaded ? Check : Download}
            onClick={handleDownload}
          >
            {downloaded ? 'Installed' : 'Get'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="card card-hover cursor-pointer group"
    >
      {/* Icon */}
      <div className="relative mb-4">
        <div className="w-full aspect-square bg-bg rounded-xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
          {app.icon}
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {app.isFeatured && (
            <Badge variant="primary" size="xs">⭐ Featured</Badge>
          )}
          {app.isNew && (
            <Badge variant="success" size="xs">NEW</Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`
            absolute top-2 right-2 p-2 rounded-full transition-all
            ${favorited 
              ? 'bg-red-500 text-white' 
              : 'bg-bg/80 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100'
            }
          `}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      {/* Title & Verified */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-semibold text-text truncate">{app.name}</h3>
        {app.isVerified && <Shield className="w-4 h-4 text-main flex-shrink-0" />}
      </div>

      {/* Description */}
      <p className="text-sm text-text-muted line-clamp-2 mb-3">{app.description}</p>
      
      {/* Rating & Size */}
      <div className="flex items-center justify-between mb-3">
        <Rating value={app.rating} size="sm" />
        <span className="text-xs text-text-muted">{app.size}</span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="outline" size="xs">
          {language?.icon} {app.language}
        </Badge>
        <Badge size="xs">
          {category?.name}
        </Badge>
        {app.price !== 'Free' && (
          <Badge variant="warning" size="xs">{app.price}</Badge>
        )}
      </div>

      {/* Download Button */}
      <Button
        variant={downloaded ? 'secondary' : 'primary'}
        fullWidth
        icon={downloaded ? Check : Download}
        onClick={handleDownload}
      >
        {downloaded ? 'Installed' : 'Get App'}
      </Button>
    </div>
  )
}

export default AppCard