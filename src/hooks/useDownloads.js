// src/hooks/useDownloads.js
import { useState, useEffect } from 'react'
import { useAppStore } from '../store'

const useDownloads = () => {
  const { downloads, addToDownloads, removeFromDownloads } = useAppStore()
  const [filter, setFilter] = useState('all')

  const filteredDownloads = useState(() => {
    switch (filter) {
      case 'recent':
        return downloads.slice(0, 5)
      case 'installed':
        return downloads.filter(d => d.installed)
      default:
        return downloads
    }
  })

  const getDownload = (appId) => {
    return downloads.find(d => d.id === appId)
  }

  const isDownloaded = (appId) => {
    return downloads.some(d => d.id === appId)
  }

  const getTotalSize = () => {
    return downloads.reduce((total, app) => {
      const size = parseFloat(app.size) || 0
      return total + size
    }, 0)
  }

  return {
    downloads: filteredDownloads[0],
    allDownloads: downloads,
    filter,
    setFilter,
    addToDownloads,
    removeFromDownloads,
    getDownload,
    isDownloaded,
    getTotalSize,
  }
}

export default useDownloads
