// src/pages/DeveloperProfile.jsx
import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Globe, Github, Twitter, Mail,
  Shield, Star, Download, Package, Calendar, MapPin
} from 'lucide-react'
import { useAppStore } from '../store'
import { Button, Avatar, Badge, Rating } from '../components/common'
import { AppGrid } from '../components/apps'
import { formatNumber, formatDate } from '../utils/formatters'

const DeveloperProfile = () => {
  const { name } = useParams()
  const navigate = useNavigate()
  const { apps } = useAppStore()

  // Find apps by this developer
  const decodedName = decodeURIComponent(name || '')
  const developerApps = apps.filter(
    app => app.developer.toLowerCase() === decodedName.toLowerCase()
  )

  // Mock developer data
  const developer = {
    name: decodedName || 'Unknown Developer',
    bio: 'Passionate about building tools that make developers more productive. Open source contributor.',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    github: 'developer',
    twitter: '@developer',
    email: 'dev@example.com',
    joinedAt: '2023-06-15',
    isVerified: true,
    totalDownloads: developerApps.reduce((sum, app) => sum + app.downloads, 0),
    totalApps: developerApps.length,
    averageRating: developerApps.length > 0
      ? developerApps.reduce((sum, app) => sum + app.rating, 0) / developerApps.length
      : 0,
  }

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

      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar size="2xl" fallback={<span className="text-4xl">👨‍💻</span>} />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-3xl font-bold">{developer.name}</h1>
              {developer.isVerified && (
                <Badge variant="primary" size="sm">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-text-muted mb-3">{developer.bio}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-text-muted">
              {developer.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {developer.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {formatDate(developer.joinedAt)}
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-2">
            {developer.website && (
              <a href={developer.website} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-bg rounded-xl hover:bg-main hover:text-bg transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
            {developer.github && (
              <a href={`https://github.com/${developer.github}`} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-bg rounded-xl hover:bg-main hover:text-bg transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {developer.twitter && (
              <a href={`https://twitter.com/${developer.twitter}`} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-bg rounded-xl hover:bg-main hover:text-bg transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            <a href={`mailto:${developer.email}`}
              className="p-2.5 bg-bg rounded-xl hover:bg-main hover:text-bg transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <Package className="w-8 h-8 mx-auto text-main mb-2" />
          <p className="text-2xl font-bold">{developer.totalApps}</p>
          <p className="text-sm text-text-muted">Apps Published</p>
        </div>
        <div className="card text-center">
          <Download className="w-8 h-8 mx-auto text-green-400 mb-2" />
          <p className="text-2xl font-bold">{formatNumber(developer.totalDownloads)}</p>
          <p className="text-sm text-text-muted">Total Downloads</p>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
          <p className="text-2xl font-bold">{developer.averageRating.toFixed(1)}</p>
          <p className="text-sm text-text-muted">Avg Rating</p>
        </div>
        <div className="card text-center">
          <Shield className="w-8 h-8 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold">
            {developerApps.filter(a => a.isVerified).length}
          </p>
          <p className="text-sm text-text-muted">Verified Apps</p>
        </div>
      </div>

      {/* Developer's Apps */}
      <div>
        <h2 className="section-title">Apps by {developer.name}</h2>
        <AppGrid
          apps={developerApps}
          emptyTitle="No apps found"
          emptyDescription="This developer hasn't published any apps yet"
        />
      </div>
    </div>
  )
}

export default DeveloperProfile