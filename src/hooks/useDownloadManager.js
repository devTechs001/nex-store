// src/hooks/useDownloadManager.js
import { useState, useEffect, useCallback } from 'react'
import { downloadManager } from '../services/downloadManager'

export const useDownloadManager = () => {
  const [downloads, setDownloads] = useState([])
  const [activeCount, setActiveCount] = useState(0)

  const refreshDownloads = useCallback(() => {
    setDownloads(downloadManager.getAllDownloads())
    setActiveCount(downloadManager.getActiveDownloads().length)
  }, [])

  useEffect(() => {
    refreshDownloads()
  }, [refreshDownloads])

  const startDownload = useCallback(async (app, callbacks = {}) => {
    const { onProgress, onComplete, onError } = callbacks

    const result = await downloadManager.start(
      app,
      (progress) => {
        refreshDownloads()
        onProgress?.(progress)
      },
      (complete) => {
        refreshDownloads()
        onComplete?.(complete)
      },
      (error) => {
        refreshDownloads()
        onError?.(error)
      }
    )

    return result
  }, [refreshDownloads])

  const pauseDownload = useCallback((downloadId) => {
    const result = downloadManager.pause(downloadId)
    refreshDownloads()
    return result
  }, [refreshDownloads])

  const resumeDownload = useCallback(async (downloadId, callbacks = {}) => {
    const { onProgress, onComplete, onError } = callbacks

    const result = downloadManager.resume(
      downloadId,
      (progress) => {
        refreshDownloads()
        onProgress?.(progress)
      },
      (complete) => {
        refreshDownloads()
        onComplete?.(complete)
      },
      (error) => {
        refreshDownloads()
        onError?.(error)
      }
    )

    return result
  }, [refreshDownloads])

  const cancelDownload = useCallback((downloadId) => {
    const result = downloadManager.cancel(downloadId)
    refreshDownloads()
    return result
  }, [refreshDownloads])

  const retryDownload = useCallback(async (downloadId, callbacks = {}) => {
    const { onProgress, onComplete, onError } = callbacks

    const result = downloadManager.retry(
      downloadId,
      (progress) => {
        refreshDownloads()
        onProgress?.(progress)
      },
      (complete) => {
        refreshDownloads()
        onComplete?.(complete)
      },
      (error) => {
        refreshDownloads()
        onError?.(error)
      }
    )

    return result
  }, [refreshDownloads])

  const getDownload = useCallback((downloadId) => {
    return downloadManager.getDownload(downloadId)
  }, [])

  const clearCompleted = useCallback(() => {
    downloadManager.clearCompleted()
    refreshDownloads()
  }, [refreshDownloads])

  return {
    downloads,
    activeCount,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    getDownload,
    clearCompleted,
    refreshDownloads,
  }
}

export default useDownloadManager
