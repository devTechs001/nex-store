// src/components/apps/DownloadManager.jsx
import React from 'react'
import { Download, Pause, Play, X, Check, AlertCircle, Clock, Wifi } from 'lucide-react'
import { Button, Badge } from '../common'
import { downloadManager } from '../../services/downloadManager'

const DownloadManager = ({ downloads, onDownloadComplete }) => {
  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'paused')

  if (activeDownloads.length === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 w-96 max-h-96 overflow-y-auto space-y-2">
      {activeDownloads.map(download => (
        <DownloadItem
          key={download.id}
          download={download}
          onComplete={onDownloadComplete}
        />
      ))}
    </div>
  )
}

const DownloadItem = ({ download, onComplete }) => {
  const isDownloading = download.status === 'downloading'
  const isPaused = download.status === 'paused'

  const handlePause = () => {
    downloadManager.pause(download.id)
  }

  const handleResume = () => {
    downloadManager.resume(download.id)
  }

  const handleCancel = () => {
    downloadManager.cancel(download.id)
  }

  return (
    <div className="bg-bg-secondary rounded-xl p-4 shadow-lg border border-bg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {download.app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{download.app.name}</h4>
          <p className="text-xs text-text-muted">v{download.app.version} • {download.app.size}</p>
        </div>
        <div className="flex items-center gap-1">
          {isDownloading && (
            <Button variant="ghost" size="sm" icon={Pause} onClick={handlePause} />
          )}
          {isPaused && (
            <Button variant="ghost" size="sm" icon={Play} onClick={handleResume} />
          )}
          <Button variant="ghost" size="sm" icon={X} onClick={handleCancel} className="text-red-400" />
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={isPaused ? 'text-yellow-500' : 'text-text-muted'}>
            {isPaused ? 'Paused' : downloadManager.formatBytes(download.speed) + '/s'}
          </span>
          <span className="text-text-muted">
            {downloadManager.formatBytes(download.downloaded)} / {downloadManager.formatBytes(download.total)}
          </span>
          <span className="text-main font-medium">{Math.round(download.progress)}%</span>
        </div>

        <div className="h-2 bg-bg rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isPaused ? 'bg-yellow-500' : 'bg-main'}`}
            style={{ width: `${download.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ETA: {downloadManager.formatTime(download.eta)}
          </span>
          {isPaused && (
            <span className="text-yellow-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Paused
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DownloadManager
