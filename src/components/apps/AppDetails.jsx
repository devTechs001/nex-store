import { useState } from 'react'
import { Download, Check, Heart, User, Star } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Badge } from '../common/Badge'
import { Rating } from '../common/Rating'
import { Button } from '../common/Button'
import { useAppStore } from '../../context/AppContext'
import { CATEGORIES, LANGUAGES, PLATFORMS } from '../../data/mockData'

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const AppDetails = ({ app, onClose }) => {
  const { addToDownloads, downloads, addToFavorites, favorites } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const isDownloaded = downloads.some(d => d.id === app.id)
  const isFavorite = favorites.some(f => f.id === app.id)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-bg rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            {app.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text">{app.name}</h1>
              {app.isNew && <Badge variant="success">NEW</Badge>}
              {app.isFeatured && <Badge variant="primary">⭐ Featured</Badge>}
            </div>
            <p className="text-text-muted mb-2">{app.developer}</p>
            <div className="flex items-center gap-4">
              <Rating value={app.rating} size="md" />
              <span className="text-sm text-text-muted">
                {formatNumber(app.downloads)} downloads
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant={isDownloaded ? 'secondary' : 'primary'}
              icon={isDownloaded ? Check : Download}
              onClick={() => !isDownloaded && addToDownloads(app)}
            >
              {isDownloaded ? 'Installed' : 'Download'}
            </Button>
            <Button
              variant="ghost"
              icon={Heart}
              className={isFavorite ? 'text-red-500' : ''}
              onClick={() => addToFavorites(app)}
            >
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.version}</p>
            <p className="text-sm text-text-muted">Version</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.size}</p>
            <p className="text-sm text-text-muted">Size</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.rating}</p>
            <p className="text-sm text-text-muted">Rating</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{formatNumber(app.downloads)}</p>
            <p className="text-sm text-text-muted">Downloads</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-bg">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-main' : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-main" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-text-muted leading-relaxed">{app.longDescription}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Screenshots</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {app.screenshots?.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-64 h-36 object-cover rounded-xl flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Category</span>
                      <span>{CATEGORIES.find(c => c.id === app.category)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Language</span>
                      <span>{LANGUAGES.find(l => l.id === app.language)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">License</span>
                      <span>{app.license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Last Update</span>
                      <span>{formatDate(app.lastUpdate)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.platforms.map(platform => (
                      <Badge key={platform} size="sm">
                        {PLATFORMS.find(p => p.id === platform)?.icon} {PLATFORMS.find(p => p.id === platform)?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {app.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 bg-bg rounded-xl p-4">
                    <Check className="w-5 h-5 text-main flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Requirements</h3>
              <div className="bg-bg rounded-xl p-4">
                <p className="text-text-muted">{app.requirements}</p>
              </div>
              <h3 className="text-lg font-semibold">Supported Platforms</h3>
              <div className="flex flex-wrap gap-3">
                {app.platforms.map(platform => (
                  <div key={platform} className="bg-bg rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{PLATFORMS.find(p => p.id === platform)?.icon}</span>
                    <span>{PLATFORMS.find(p => p.id === platform)?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Reviews</h3>
                <Button variant="outline" size="sm">Write Review</Button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-bg rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-main/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-main" />
                      </div>
                      <div>
                        <p className="font-medium">User {i}</p>
                        <Rating value={4 + Math.random()} size="sm" showValue={false} />
                      </div>
                    </div>
                    <p className="text-text-muted text-sm">
                      Great app! Really helped with my workflow. The features are exactly what I needed.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {app.tags?.map(tag => (
              <Badge key={tag} variant="outline" size="xs">#{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
