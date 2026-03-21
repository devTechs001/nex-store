// src/components/common/CommandPalette.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Search, Home, Package, Download, Heart, User,
  Settings, Upload, FolderOpen, Shield, BarChart3,
  ArrowRight, Clock, Star
} from 'lucide-react'
import { useAppStore } from '../../store'

const CommandPalette = () => {
  const navigate = useNavigate()
  const { apps, searchHistory } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // Commands
  const pages = [
    { id: 'home', label: 'Go to Home', icon: Home, action: () => navigate('/') },
    { id: 'explore', label: 'Explore Apps', icon: Package, action: () => navigate('/explore') },
    { id: 'downloads', label: 'My Downloads', icon: Download, action: () => navigate('/downloads') },
    { id: 'favorites', label: 'My Favorites', icon: Heart, action: () => navigate('/favorites') },
    { id: 'collections', label: 'Collections', icon: FolderOpen, action: () => navigate('/collections') },
    { id: 'profile', label: 'Profile', icon: User, action: () => navigate('/profile') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => navigate('/settings') },
    { id: 'upload', label: 'Upload App', icon: Upload, action: () => navigate('/upload') },
    { id: 'admin', label: 'Admin Dashboard', icon: Shield, action: () => navigate('/admin') },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, action: () => navigate('/admin/analytics') },
  ]

  const filteredApps = useMemo(() => {
    if (!query.trim()) return []
    return apps.filter(app =>
      app.name.toLowerCase().includes(query.toLowerCase()) ||
      app.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }, [apps, query])

  const filteredPages = useMemo(() => {
    if (!query.trim()) return pages.slice(0, 5)
    return pages.filter(page =>
      page.label.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const allResults = [
    ...filteredPages.map(p => ({ ...p, type: 'page' })),
    ...filteredApps.map(a => ({
      id: `app-${a.id}`,
      label: a.name,
      sublabel: a.developer,
      icon: () => <span className="text-xl">{a.icon}</span>,
      action: () => navigate(`/app/${a.id}`),
      type: 'app',
    })),
  ]

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = allResults[selectedIndex]
        if (selected) {
          selected.action()
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, allResults])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative flex justify-center pt-[15vh]">
        <div className="w-full max-w-xl bg-bg-secondary rounded-2xl shadow-2xl overflow-hidden animate-slide-down border border-bg">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-bg">
            <Search className="w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-text placeholder:text-text-muted focus:outline-none text-lg"
            />
            <kbd className="px-2 py-1 bg-bg rounded text-xs text-text-muted">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {/* Recent Searches */}
            {!query && searchHistory.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Recent Searches
                </p>
                {searchHistory.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(q); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Pages */}
            {filteredPages.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Pages
                </p>
                {filteredPages.map((page, i) => {
                  const Icon = page.icon
                  const globalIndex = i
                  return (
                    <button
                      key={page.id}
                      onClick={() => { page.action(); setIsOpen(false) }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                        selectedIndex === globalIndex ? 'bg-main/20 text-main' : 'hover:bg-bg'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 font-medium">{page.label}</span>
                      <ArrowRight className="w-4 h-4 text-text-muted" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Apps */}
            {filteredApps.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Apps
                </p>
                {filteredApps.map((app, i) => {
                  const globalIndex = filteredPages.length + i
                  return (
                    <button
                      key={app.id}
                      onClick={() => { navigate(`/app/${app.id}`); setIsOpen(false) }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                        selectedIndex === globalIndex ? 'bg-main/20 text-main' : 'hover:bg-bg'
                      }`}
                    >
                      <span className="text-xl w-8 h-8 flex items-center justify-center">{app.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-text-muted">{app.developer}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Star className="w-3 h-3 text-yellow-400" />
                        {app.rating}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {query && allResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-text-muted">No results for "{query}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-bg text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg rounded">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg rounded">↵</kbd> Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-bg rounded">ESC</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CommandPalette