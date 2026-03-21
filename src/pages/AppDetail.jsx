// src/pages/AppDetail.jsx
import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Download, Heart, Share2, ExternalLink,
  Check, Shield, Clock, Star, ChevronRight, Rocket, Trash2
} from 'lucide-react'
import { useAppStore } from '../store'
import { useDownloadManager, useInstallationManager } from '../hooks'
import { useToast } from '../context/ToastContext'
import { Button, Badge, Rating, Tabs } from '../components/common'
import { AppScreenshots, AppReviews, AppGrid, InstallationProgress } from '../components/apps'
import { getAppById, MOCK_APPS } from '../data/mockApps'
import { getCategoryById } from '../data/categories'
import { getLanguageById } from '../data/languages'
import { PLATFORMS, getPlatformById } from '../data/platforms'
import { formatNumber, formatDate } from '../utils/formatters'

const AppDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { addToDownloads, isDownloaded, toggleFavorite, isFavorite } = useAppStore()
  const { startDownload, getDownload } = useDownloadManager()
  const { install, isInstalled, launch, uninstall, getInstallation } = useInstallationManager()

  const app = getAppById(id)
  const [installing, setInstalling] = useState(false)

  if (!app) {
    return (
      <div className="page-container text-center">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <p className="text-text-muted mb-6">The app you're looking for doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/explore')}>
          Browse Apps
        </Button>
      </div>
    )
  }

  const downloaded = isDownloaded(app.id)
  const favorited = isFavorite(app.id)
  const installed = isInstalled(app.id)
  const category = getCategoryById(app.category)
  const language = getLanguageById(app.language)

  // Get download/install status
  const download = getDownload(app.id)
  const installation = getInstallation(app.id)
  const isDownloading = download?.status === 'downloading' || download?.status === 'pending'
  const isInstalling = installation?.status === 'installing'

  const handleDownload = async () => {
    if (downloaded || isDownloading) return

    const result = await startDownload(app, {
      onComplete: () => {
        toast.success(`${app.name} downloaded! Starting installation...`)
        handleInstall()
      },
      onError: (error) => {
        toast.error(`Download failed: ${error}`)
      },
    })

    if (result.success) {
      addToDownloads(app)
      toast.success(`Downloading ${app.name}...`)
    }
  }

  const handleInstall = async () => {
    if (!downloaded || installed || isInstalling) return

    setInstalling(true)
    const result = await install(app, {
      onComplete: () => {
        toast.success(`${app.name} installed successfully!`)
        setInstalling(false)
      },
      onError: (error) => {
        toast.error(`Installation failed: ${error}`)
        setInstalling(false)
      },
    })

    if (result.success) {
      toast.success(`Installing ${app.name}...`)
    }
  }

  const handleLaunch = () => {
    const result = launch(app.id)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error)
    }
  }

  const handleUninstall = () => {
    uninstall(app.id)
    toast.info(`${app.name} uninstalled`)
  }

  const handleFavorite = () => {
    const added = toggleFavorite(app)
    toast.success(added ? 'Added to favorites' : 'Removed from favorites')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  // Get primary action button
  const getPrimaryAction = () => {
    if (installed) {
      return (
        <>
          <Button
            variant="primary"
            size="lg"
            icon={Rocket}
            onClick={handleLaunch}
            fullWidth
          >
            Launch
          </Button>
          <Button
            variant="ghost"
            size="lg"
            icon={Trash2}
            onClick={handleUninstall}
            className="text-red-400"
          />
        </>
      )
    }

    if (isInstalling) {
      return (
        <Button
          variant="secondary"
          size="lg"
          icon={Check}
          loading
          fullWidth
          disabled
        >
          Installing...
        </Button>
      )
    }

    if (isDownloading) {
      return (
        <Button
          variant="secondary"
          size="lg"
          icon={Download}
          fullWidth
          disabled
        >
          {Math.round(download?.progress || 0)}%
        </Button>
      )
    }

    if (downloaded) {
      return (
        <Button
          variant="primary"
          size="lg"
          icon={Check}
          onClick={handleInstall}
          fullWidth
        >
          Install
        </Button>
      )
    }

    return (
      <Button
        variant="primary"
        size="lg"
        icon={Download}
        onClick={handleDownload}
        fullWidth
      >
        {app.price === 'Free' ? 'Install Free' : `Get - ${app.price}`}
      </Button>
    )
  }

  // Related apps (same category)
  const relatedApps = MOCK_APPS
    .filter(a => a.category === app.category && a.id !== app.id)
    .slice(0, 4)

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About this app</h3>
            <p className="text-text-muted leading-relaxed">{app.longDescription}</p>
          </div>

          {/* Screenshots */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Screenshots</h3>
            <AppScreenshots screenshots={app.screenshots} />
          </div>

          {/* Features */}
          {app.features && app.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {app.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-text-muted">
                    <Check className="w-4 h-4 text-main flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {app.requirements && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              <p className="text-text-muted">{app.requirements}</p>
            </div>
          )}

          {/* Changelog */}
          {app.changelog && app.changelog.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">What's New</h3>
              <div className="space-y-4">
                {app.changelog.slice(0, 3).map((log, i) => (
                  <div key={i} className="bg-bg rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">v{log.version}</span>
                      <span className="text-sm text-text-muted">{formatDate(log.date)}</span>
                    </div>
                    <ul className="space-y-1">
                      {log.changes.map((change, j) => (
                        <li key={j} className="text-sm text-text-muted flex items-center gap-2">
                          <span className="w-1 h-1 bg-main rounded-full" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'reviews',
      label: `Reviews (${formatNumber(app.reviews)})`,
      content: <AppReviews appId={app.id} />,
    },
  ]

  return (
    <div className="page-container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Icon */}
          <div className="w-32 h-32 bg-bg rounded-2xl flex items-center justify-center text-6xl flex-shrink-0 mx-auto md:mx-0">
            {app.icon}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold">{app.name}</h1>
              {app.isVerified && (
                <Badge variant="success" size="sm">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {app.isNew && (
                <Badge variant="primary" size="sm">NEW</Badge>
              )}
            </div>

            <p className="text-text-muted mb-4">{app.developer}</p>

            {/* Rating */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="text-2xl font-bold">{app.rating}</span>
                <span className="text-text-muted">({formatNumber(app.reviews)} reviews)</span>
              </div>
              <div className="text-text-muted">
                {formatNumber(app.downloads)} downloads
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2">
                {getPrimaryAction()}
              </div>
              <Button
                variant="ghost"
                size="lg"
                icon={favorited ? Heart : Heart}
                onClick={handleFavorite}
                className={favorited ? 'text-red-500' : ''}
              >
                {favorited && <Heart className="w-5 h-5 fill-current" />}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={Share2}
                onClick={handleShare}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Clock className="w-6 h-6 mx-auto text-main mb-2" />
          <p className="text-sm text-text-muted">Updated</p>
          <p className="font-medium">{formatDate(app.lastUpdate)}</p>
        </div>
        <div className="card text-center">
          <Shield className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <p className="text-sm text-text-muted">License</p>
          <p className="font-medium">{app.license}</p>
        </div>
        <div className="card text-center">
          <span className="text-2xl mb-2 block">{language?.icon}</span>
          <p className="text-sm text-text-muted">Language</p>
          <p className="font-medium">{language?.name}</p>
        </div>
        <div className="card text-center">
          <span className="text-2xl mb-2 block">{app.platforms.length}</span>
          <p className="text-sm text-text-muted">Platforms</p>
          <div className="flex justify-center gap-1 flex-wrap">
            {app.platforms.slice(0, 3).map(p => (
              <span key={p} className="text-lg">
                {PLATFORMS.find(pl => pl.id === p)?.icon}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />

      {/* Related Apps */}
      {relatedApps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">More from {category?.name}</h2>
            <Link
              to={`/category/${category?.slug}`}
              className="text-main hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <AppGrid apps={relatedApps} columns={4} />
        </div>
      )}

      {/* Installation Progress */}
      {isInstalling && (
        <InstallationProgress 
          installations={[installation]} 
          onInstallComplete={() => setInstalling(false)}
        />
      )}
    </div>
  )
}

export default AppDetail
