// src/services/downloadManager.js
import { storage } from './storage'

class DownloadManager {
  constructor() {
    this.downloads = new Map()
    this.queue = []
    this.activeDownloads = new Set()
    this.maxConcurrent = 3
    this.storageKey = 'download_progress'
    
    // Load saved progress
    this.loadProgress()
  }

  loadProgress() {
    const saved = storage.get(this.storageKey, {})
    Object.entries(saved).forEach(([id, progress]) => {
      this.downloads.set(id, progress)
    })
  }

  saveProgress() {
    const progress = {}
    this.downloads.forEach((value, key) => {
      progress[key] = value
    })
    storage.set(this.storageKey, progress)
  }

  // Start a download
  async start(app, onProgress, onComplete, onError) {
    const downloadId = app.id

    // Check if already downloading
    if (this.activeDownloads.has(downloadId)) {
      return { success: false, error: 'Already downloading' }
    }

    // Check if paused
    const existing = this.downloads.get(downloadId)
    if (existing && existing.status === 'completed') {
      return { success: false, error: 'Already downloaded' }
    }

    const download = {
      id: downloadId,
      app: {
        id: app.id,
        name: app.name,
        icon: app.icon,
        version: app.version,
        size: app.size,
      },
      status: 'pending',
      progress: 0,
      speed: 0,
      eta: 0,
      downloaded: 0,
      total: this.parseSize(app.size),
      startTime: null,
      pausedAt: null,
    }

    this.downloads.set(downloadId, download)
    this.queue.push(downloadId)
    this.processQueue()

    // Simulate download progress
    this.simulateDownload(downloadId, onProgress, onComplete, onError)

    return { success: true, downloadId }
  }

  parseSize(sizeStr) {
    if (!sizeStr) return 50 * 1024 * 1024 // Default 50MB
    const match = sizeStr.match(/([\d.]+)\s*(MB|GB|KB)/i)
    if (!match) return 50 * 1024 * 1024
    
    const [, value, unit] = match
    const num = parseFloat(value)
    
    switch (unit.toUpperCase()) {
      case 'GB': return num * 1024 * 1024 * 1024
      case 'MB': return num * 1024 * 1024
      case 'KB': return num * 1024
      default: return num
    }
  }

  simulateDownload(downloadId, onProgress, onComplete, onError) {
    const download = this.downloads.get(downloadId)
    if (!download) return

    this.activeDownloads.add(downloadId)
    download.status = 'downloading'
    download.startTime = Date.now()

    const simulateProgress = () => {
      const current = this.downloads.get(downloadId)
      if (!current || current.status === 'paused' || current.status === 'cancelled') {
        return
      }

      // Random progress increment
      const increment = Math.random() * 5 + 2
      current.progress = Math.min(100, current.progress + increment)
      current.downloaded = (current.total * current.progress) / 100
      
      // Calculate speed (bytes/sec)
      const elapsed = (Date.now() - current.startTime) / 1000
      current.speed = elapsed > 0 ? current.downloaded / elapsed : 0
      
      // Calculate ETA
      const remaining = current.total - current.downloaded
      current.eta = current.speed > 0 ? remaining / current.speed : 0

      this.saveProgress()
      onProgress?.(current)

      if (current.progress >= 100) {
        current.status = 'completed'
        current.completedAt = new Date().toISOString()
        this.activeDownloads.delete(downloadId)
        this.saveProgress()
        onComplete?.(current)
      } else {
        setTimeout(simulateProgress, 500 + Math.random() * 500)
      }
    }

    simulateProgress()
  }

  // Pause a download
  pause(downloadId) {
    const download = this.downloads.get(downloadId)
    if (!download || download.status !== 'downloading') return false

    download.status = 'paused'
    download.pausedAt = Date.now()
    this.activeDownloads.delete(downloadId)
    this.saveProgress()
    this.processQueue()
    return true
  }

  // Resume a paused download
  resume(downloadId, onProgress, onComplete, onError) {
    const download = this.downloads.get(downloadId)
    if (!download || download.status !== 'paused') return false

    download.status = 'downloading'
    this.queue.push(downloadId)
    this.processQueue()
    
    // Resume simulation from current progress
    this.simulateDownload(downloadId, onProgress, onComplete, onError)
    return true
  }

  // Cancel a download
  cancel(downloadId) {
    const download = this.downloads.get(downloadId)
    if (!download) return false

    download.status = 'cancelled'
    this.activeDownloads.delete(downloadId)
    this.queue = this.queue.filter(id => id !== downloadId)
    this.downloads.delete(downloadId)
    this.saveProgress()
    this.processQueue()
    return true
  }

  // Retry a failed download
  retry(downloadId, onProgress, onComplete, onError) {
    const download = this.downloads.get(downloadId)
    if (!download) return false

    download.status = 'pending'
    download.progress = 0
    download.downloaded = 0
    download.startTime = null
    this.queue.push(downloadId)
    this.processQueue()
    
    this.simulateDownload(downloadId, onProgress, onComplete, onError)
    return true
  }

  // Process download queue
  processQueue() {
    while (this.queue.length > 0 && this.activeDownloads.size < this.maxConcurrent) {
      const downloadId = this.queue.shift()
      const download = this.downloads.get(downloadId)
      
      if (download && download.status === 'pending') {
        // Will be started by the caller
      }
    }
  }

  // Get download status
  getDownload(downloadId) {
    return this.downloads.get(downloadId)
  }

  // Get all downloads
  getAllDownloads() {
    return Array.from(this.downloads.values())
  }

  // Get active downloads
  getActiveDownloads() {
    return this.getAllDownloads().filter(d => d.status === 'downloading')
  }

  // Get paused downloads
  getPausedDownloads() {
    return this.getAllDownloads().filter(d => d.status === 'paused')
  }

  // Get completed downloads
  getCompletedDownloads() {
    return this.getAllDownloads().filter(d => d.status === 'completed')
  }

  // Clear completed downloads
  clearCompleted() {
    this.getAllDownloads()
      .filter(d => d.status === 'completed')
      .forEach(d => this.downloads.delete(d.id))
    this.saveProgress()
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format seconds to human readable time
  formatTime(seconds) {
    if (!isFinite(seconds)) return '--:--'
    if (seconds < 60) return `${Math.floor(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }
}

export const downloadManager = new DownloadManager()
export default downloadManager
