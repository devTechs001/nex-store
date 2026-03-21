import { createContext, useContext, useState } from 'react'
import { MOCK_APPS } from '../data/mockData'

const AppContext = createContext()

export const useAppStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}

export const AppProvider = ({ children }) => {
  const [apps, setApps] = useState(MOCK_APPS)
  const [downloads, setDownloads] = useState([])
  const [favorites, setFavorites] = useState([])
  const [toast, setToast] = useState(null)

  const addToDownloads = (app) => {
    if (!downloads.some(d => d.id === app.id)) {
      setDownloads([...downloads, { ...app, downloadDate: new Date() }])
      setToast({ message: `${app.name} downloaded successfully!`, type: 'success' })
    }
  }

  const removeFromDownloads = (appId) => {
    setDownloads(downloads.filter(d => d.id !== appId))
    setToast({ message: 'App removed from downloads', type: 'info' })
  }

  const addToFavorites = (app) => {
    if (favorites.some(f => f.id === app.id)) {
      setFavorites(favorites.filter(f => f.id !== app.id))
      setToast({ message: `${app.name} removed from favorites`, type: 'info' })
    } else {
      setFavorites([...favorites, app])
      setToast({ message: `${app.name} added to favorites!`, type: 'success' })
    }
  }

  const addApp = (app) => {
    setApps([app, ...apps])
    setToast({ message: 'App uploaded successfully!', type: 'success' })
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  return (
    <AppContext.Provider value={{
      apps,
      downloads,
      favorites,
      addToDownloads,
      removeFromDownloads,
      addToFavorites,
      addApp,
      showToast,
    }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppContext.Provider>
  )
}

// Toast Component
import { Info, Check, AlertCircle, X } from 'lucide-react'
import { useEffect } from 'react'

function Toast({ message, type = 'info', onClose }) {
  const types = {
    info: { icon: Info, bg: 'bg-blue-500' },
    success: { icon: Check, bg: 'bg-green-500' },
    warning: { icon: AlertCircle, bg: 'bg-yellow-500' },
    error: { icon: AlertCircle, bg: 'bg-red-500' },
  }

  const { icon: Icon, bg } = types[type]

  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg animate-slide-up`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
