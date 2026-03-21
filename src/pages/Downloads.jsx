// src/pages/Downloads.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download, Trash2, Search, Eye, RefreshCw,
  CheckCircle, Clock, AlertCircle, Play, Pause, Rocket
} from 'lucide-react'
import { useAppStore } from '../store'
import { useDownloadManager, useInstallationManager } from '../hooks'
import { useToast } from '../context/ToastContext'
import { Button, Badge, EmptyState, Input } from '../components/common'
import { DownloadManager, InstallationProgress } from '../components/apps'
import { formatDate } from '../utils/formatters'

const Downloads = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { downloads, removeFromDownloads } = useAppStore()
  const { 
    downloads: activeDownloads, 
    pauseDownload, 
    resumeDownload, 
    cancelDownload,
    clearCompleted,
  } = useDownloadManager()
  const { 
    installations, 
    isInstalled, 
    launch, 
    uninstall,
  } = useInstallationManager()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, recent, old, installing

  const handleRemove = (app) => {
    removeFromDownloads(app.id)
    cancelDownload(app.id)
    toast.info(`${app.name} removed from downloads`)
  }

  const handleRemoveAll = () => {
    downloads.forEach(app => removeFromDownloads(app.id))
    clearCompleted()
    toast.info('All downloads cleared')
  }

  const handleLaunch = (appId) => {
    const result = launch(appId)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error)
    }
  }

  const handleUninstall = (appId) => {
    uninstall(appId)
    toast.info('App uninstalled')
  }

  const filteredDownloads = downloads
    .filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === 'recent') {
        return new Date(b.downloadDate) - new Date(a.downloadDate)
      }
      if (filter === 'old') {
        return new Date(a.downloadDate) - new Date(b.downloadDate)
      }
      return 0
    })

  const installingApps = installations.filter(i => i.status === 'installing')
  const installedApps = installations.filter(i => i.status === 'installed')

  if (downloads.length === 0 && activeDownloads.length === 0) {
    return (
      <div className="page-container">
        <h1 className="title">Downloads</h1>
        <EmptyState
          icon={Download}
          title="No downloads yet"
          description="Apps you download will appear here for easy access"
          action={() => navigate('/explore')}
          actionLabel="Explore Apps"
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="title">Downloads</h1>

      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Download className="w-5 h-5 text-main" />
            Active Downloads ({activeDownloads.length})
          </h2>
          <div className="grid gap-4">
            {activeDownloads.map(download => (
              <div key={download.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {download.app.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{download.app.name}</h3>
                        <p className="text-sm text-text-muted">v{download.app.version} • {download.app.size}</p>
                      </div>
                      <div className="flex gap-2">
                        {download.status === 'downloading' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Pause}
                            onClick={() => pauseDownload(download.id)}
                          />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Play}
                            onClick={() => resumeDownload(download.id)}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => cancelDownload(download.id)}
                          className="text-red-400"
                        />
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={download.status === 'paused' ? 'text-yellow-500' : 'text-text-muted'}>
                          {download.status === 'paused' ? 'Paused' : 'Downloading...'}
                        </span>
                        <span className="text-main font-medium">{Math.round(download.progress)}%</span>
                      </div>
                      <div className="h-2 bg-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            download.status === 'paused' ? 'bg-yellow-500' : 'bg-main'
                          }`}
                          style={{ width: `${download.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Installing Apps */}
      {installingApps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-main animate-spin" />
            Installing ({installingApps.length})
          </h2>
          <div className="grid gap-4">
            {installingApps.map(installation => (
              <div key={installation.id} className="card">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl relative">
                    {installation.app.icon}
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/80 rounded-xl">
                      <RefreshCw className="w-6 h-6 text-main animate-spin" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{installation.app.name}</h3>
                    <p className="text-sm text-text-muted">
                      {installation.stage.replace('_', ' ')}...
                    </p>
                    <div className="h-2 bg-bg rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-main transition-all"
                        style={{ width: `${installation.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloaded Apps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Downloaded ({filteredDownloads.length})
          </h2>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input max-w-[150px]"
            >
              <option value="all">All</option>
              <option value="recent">Recent First</option>
              <option value="old">Oldest First</option>
            </select>
            <Button variant="danger" icon={Trash2} onClick={handleRemoveAll}>
              Clear All
            </Button>
          </div>
        </div>

        <Input
          icon={Search}
          placeholder="Search downloads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="max-w-xs"
        />

        <div className="grid gap-3">
          {filteredDownloads.map((app) => {
            const installed = isInstalled(app.id)
            return (
              <div key={app.id} className="card flex items-center gap-4">
                <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {app.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{app.name}</h3>
                    <Badge variant={installed ? 'success' : 'default'} size="xs">
                      {installed ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Installed</>
                      ) : (
                        <><Download className="w-3 h-3 mr-1" /> Downloaded</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted">{app.developer}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                    <span>v{app.version}</span>
                    <span>•</span>
                    <span>{app.size}</span>
                    <span>•</span>
                    <span>Downloaded {formatDate(app.downloadDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/app/${app.id}`)}
                  />
                  {installed ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Rocket}
                        onClick={() => handleLaunch(app.id)}
                      >
                        Launch
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleUninstall(app.id)}
                        className="text-red-400"
                      />
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={RefreshCw}
                      onClick={() => toast.info('Already up to date!')}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleRemove(app)}
                    className="text-red-400"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {filteredDownloads.length === 0 && searchQuery && (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No downloads match "${searchQuery}"`}
          />
        )}
      </div>

      {/* Floating Managers */}
      <DownloadManager downloads={activeDownloads} />
      <InstallationProgress installations={installingApps} />
    </div>
  )
}

export default Downloads
