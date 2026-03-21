// src/components/common/PWAPrompts.jsx
import React from 'react'
import { Download, Wifi, WifiOff, RefreshCw, X, Smartphone } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'
import Button from './Button'

// Install Banner
export const InstallBanner = () => {
  const { canInstall, install } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-main/20 to-purple-500/20 backdrop-blur-lg border border-main/30 rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-main/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-main" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install AppStore</h3>
            <p className="text-sm text-text-muted mb-3">
              Install for quick access and offline support
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" icon={Download} onClick={install}>
                Install
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
                Not now
              </Button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-text-muted hover:text-text">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Offline Banner
export const OfflineBanner = () => {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      You're offline. Some features may be limited.
    </div>
  )
}

// Update Banner
export const UpdateBanner = () => {
  const { updateAvailable, update } = usePWA()

  if (!updateAvailable) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-main text-bg px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <RefreshCw className="w-4 h-4" />
      A new version is available!
      <button onClick={update} className="underline font-bold ml-2">
        Update Now
      </button>
    </div>
  )
}