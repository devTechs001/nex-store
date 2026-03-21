// src/pages/Bundles.jsx
import React, { useState } from 'react'
import { Package, Star, Download, ChevronRight, Zap, Shield, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { useToast } from '../context/ToastContext'
import { Button, Badge, Rating } from '../components/common'
import { formatNumber } from '../utils/formatters'

const BUNDLES = [
  {
    id: 1,
    name: 'Web Developer Starter Pack',
    description: 'Everything you need to start building modern web applications.',
    icon: '🌐',
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    appIds: [2, 4, 10],
    price: 'Free',
    originalPrice: null,
    downloads: 45230,
    rating: 4.8,
    tags: ['web', 'frontend', 'starter'],
  },
  {
    id: 2,
    name: 'DevOps Essentials',
    description: 'Container management, CI/CD, and monitoring tools for modern infrastructure.',
    icon: '🐳',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    appIds: [5, 10],
    price: 'Free',
    originalPrice: null,
    downloads: 34500,
    rating: 4.7,
    tags: ['devops', 'docker', 'ci-cd'],
  },
  {
    id: 3,
    name: 'Data Science Suite',
    description: 'Complete toolkit for data analysis, machine learning, and visualization.',
    icon: '🤖',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 to-pink-500/20',
    appIds: [1, 8],
    price: '$49.99',
    originalPrice: '$129.99',
    downloads: 28900,
    rating: 4.9,
    tags: ['data-science', 'ml', 'analytics'],
  },
  {
    id: 4,
    name: 'Mobile Dev Kit',
    description: 'Build beautiful mobile apps with these essential development tools.',
    icon: '📱',
    color: '#10b981',
    gradient: 'from-green-500/20 to-emerald-500/20',
    appIds: [9, 4],
    price: 'Free',
    originalPrice: null,
    downloads: 19800,
    rating: 4.6,
    tags: ['mobile', 'ios', 'android'],
  },
  {
    id: 5,
    name: 'Game Dev Pro',
    description: 'Professional game development tools for creating amazing games.',
    icon: '🎮',
    color: '#ef4444',
    gradient: 'from-red-500/20 to-orange-500/20',
    appIds: [6],
    price: '$199.99',
    originalPrice: '$299.99',
    downloads: 12400,
    rating: 4.5,
    tags: ['gamedev', 'graphics', '3d'],
  },
]

const Bundles = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { apps, addToDownloads } = useAppStore()

  const handleInstallBundle = (bundle) => {
    const bundleApps = bundle.appIds.map(id => apps.find(a => a.id === id)).filter(Boolean)
    bundleApps.forEach(app => addToDownloads(app))
    toast.success(`${bundle.name} installed! (${bundleApps.length} apps)`)
  }

  const getBundleApps = (bundle) => {
    return bundle.appIds.map(id => apps.find(a => a.id === id)).filter(Boolean)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-main/20 flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-main" />
        </div>
        <h1 className="text-4xl font-bold mb-3">App Bundles</h1>
        <p className="text-xl text-text-muted max-w-xl mx-auto">
          Curated collections of apps that work great together. Install everything you need with one click.
        </p>
      </div>

      {/* Bundles Grid */}
      <div className="space-y-6">
        {BUNDLES.map((bundle) => {
          const bundleApps = getBundleApps(bundle)
          const savings = bundle.originalPrice
            ? ((1 - parseFloat(bundle.price.replace('$', '')) / parseFloat(bundle.originalPrice.replace('$', ''))) * 100).toFixed(0)
            : null

          return (
            <div
              key={bundle.id}
              className={`card bg-gradient-to-r ${bundle.gradient} overflow-hidden`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${bundle.color}30` }}
                    >
                      {bundle.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">{bundle.name}</h2>
                        {savings && (
                          <Badge variant="danger" size="sm">
                            <Tag className="w-3 h-3 mr-1" />
                            Save {savings}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-text-muted">{bundle.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <Rating value={bundle.rating} size="sm" />
                    <span className="flex items-center gap-1 text-text-muted">
                      <Download className="w-4 h-4" />
                      {formatNumber(bundle.downloads)}
                    </span>
                    <span className="flex items-center gap-1 text-text-muted">
                      <Package className="w-4 h-4" />
                      {bundleApps.length} apps
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bundle.tags.map(tag => (
                      <Badge key={tag} variant="outline" size="xs">#{tag}</Badge>
                    ))}
                  </div>

                  {/* Price & Install */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold" style={{ color: bundle.color }}>
                        {bundle.price}
                      </span>
                      {bundle.originalPrice && (
                        <span className="text-text-muted line-through">{bundle.originalPrice}</span>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      icon={Download}
                      onClick={() => handleInstallBundle(bundle)}
                    >
                      Install Bundle
                    </Button>
                  </div>
                </div>

                {/* Apps Preview */}
                <div className="lg:w-80 flex-shrink-0">
                  <h3 className="text-sm font-medium text-text-muted mb-3">Included Apps</h3>
                  <div className="space-y-2">
                    {bundleApps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => navigate(`/app/${app.id}`)}
                        className="w-full flex items-center gap-3 p-3 bg-bg/50 rounded-xl hover:bg-bg transition-colors text-left"
                      >
                        <span className="text-2xl">{app.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{app.name}</p>
                          <p className="text-xs text-text-muted">{app.size}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Bundles