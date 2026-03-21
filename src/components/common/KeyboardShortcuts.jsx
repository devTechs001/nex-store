// src/components/common/KeyboardShortcuts.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { useUIStore } from '../../store'

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open Search', action: 'search' },
  { keys: ['⌘', 'U'], description: 'Upload App', action: 'upload' },
  { keys: ['⌘', '1'], description: 'Go to Home', action: 'home' },
  { keys: ['⌘', '2'], description: 'Go to Explore', action: 'explore' },
  { keys: ['⌘', '3'], description: 'Go to Downloads', action: 'downloads' },
  { keys: ['⌘', '4'], description: 'Go to Favorites', action: 'favorites' },
  { keys: ['⌘', '5'], description: 'Go to Profile', action: 'profile' },
  { keys: ['⌘', ','], description: 'Go to Settings', action: 'settings' },
  { keys: ['⌘', '/'], description: 'Show Shortcuts', action: 'shortcuts' },
  { keys: ['Esc'], description: 'Close Modal / Go Back', action: 'escape' },
]

const KeyboardShortcuts = () => {
  const navigate = useNavigate()
  const { closeAllModals } = useUIStore()
  const [showHelp, setShowHelp] = useState(false)

  const handleShortcut = useCallback((action) => {
    switch (action) {
      case 'search':
        navigate('/search')
        break
      case 'upload':
        navigate('/upload')
        break
      case 'home':
        navigate('/')
        break
      case 'explore':
        navigate('/explore')
        break
      case 'downloads':
        navigate('/downloads')
        break
      case 'favorites':
        navigate('/favorites')
        break
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'shortcuts':
        setShowHelp(prev => !prev)
        break
      case 'escape':
        closeAllModals()
        setShowHelp(false)
        break
      default:
        break
    }
  }, [navigate, closeAllModals])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key === 'k') {
        e.preventDefault()
        handleShortcut('search')
      } else if (isMeta && e.key === 'u') {
        e.preventDefault()
        handleShortcut('upload')
      } else if (isMeta && e.key === '1') {
        e.preventDefault()
        handleShortcut('home')
      } else if (isMeta && e.key === '2') {
        e.preventDefault()
        handleShortcut('explore')
      } else if (isMeta && e.key === '3') {
        e.preventDefault()
        handleShortcut('downloads')
      } else if (isMeta && e.key === '4') {
        e.preventDefault()
        handleShortcut('favorites')
      } else if (isMeta && e.key === '5') {
        e.preventDefault()
        handleShortcut('profile')
      } else if (isMeta && e.key === ',') {
        e.preventDefault()
        handleShortcut('settings')
      } else if (isMeta && e.key === '/') {
        e.preventDefault()
        handleShortcut('shortcuts')
      } else if (e.key === 'Escape') {
        handleShortcut('escape')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleShortcut])

  return (
    <Modal
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      title="Keyboard Shortcuts"
      size="sm"
    >
      <div className="space-y-3">
        {shortcuts.map((shortcut, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-bg last:border-0"
          >
            <span className="text-text-muted">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, j) => (
                <React.Fragment key={j}>
                  <kbd className="px-2 py-1 bg-bg rounded-lg text-xs font-mono font-bold text-main border border-bg-secondary">
                    {key}
                  </kbd>
                  {j < shortcut.keys.length - 1 && (
                    <span className="text-text-muted text-xs">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-4 text-center">
        Use Ctrl on Windows/Linux, ⌘ on macOS
      </p>
    </Modal>
  )
}

export default KeyboardShortcuts