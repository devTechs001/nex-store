// src/services/featureFlags.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_FLAGS = {
  // UI Features
  'dark-mode': { enabled: true, description: 'Dark mode theme' },
  'animations': { enabled: true, description: 'UI animations and transitions' },
  'command-palette': { enabled: true, description: 'Command palette (⌘K)' },
  'chat-widget': { enabled: true, description: 'Live chat support widget' },
  'feedback-widget': { enabled: true, description: 'Feedback collection widget' },
  'cookie-consent': { enabled: true, description: 'Cookie consent banner' },
  'onboarding': { enabled: true, description: 'New user onboarding flow' },
  'pwa-install': { enabled: true, description: 'PWA install prompt' },
  
  // Core Features
  'app-comparison': { enabled: true, description: 'Compare apps side by side' },
  'app-bundles': { enabled: true, description: 'App bundle/pack pages' },
  'collections': { enabled: true, description: 'User collections' },
  'qr-sharing': { enabled: true, description: 'QR code sharing' },
  'achievements': { enabled: true, description: 'Gamification achievements' },
  'beta-program': { enabled: true, description: 'Beta testing program' },
  'app-requests': { enabled: true, description: 'App request system' },
  'developer-dashboard': { enabled: true, description: 'Developer analytics dashboard' },
  
  // Experimental
  'ai-recommendations': { enabled: false, description: 'AI-powered app recommendations' },
  'voice-search': { enabled: false, description: 'Voice search functionality' },
  'ar-preview': { enabled: false, description: 'AR app preview' },
  'social-features': { enabled: false, description: 'Social networking features' },
  'live-collaboration': { enabled: false, description: 'Live collaboration tools' },
}

export const useFeatureFlags = create(
  persist(
    (set, get) => ({
      flags: DEFAULT_FLAGS,
      overrides: {},

      isEnabled: (flagName) => {
        const { flags, overrides } = get()
        if (overrides[flagName] !== undefined) return overrides[flagName]
        return flags[flagName]?.enabled ?? false
      },

      toggle: (flagName) => {
        const { overrides } = get()
        const currentValue = get().isEnabled(flagName)
        set({ overrides: { ...overrides, [flagName]: !currentValue } })
      },

      setFlag: (flagName, enabled) => {
        const { overrides } = get()
        set({ overrides: { ...overrides, [flagName]: enabled } })
      },

      resetAll: () => set({ overrides: {} }),

      resetFlag: (flagName) => {
        const { overrides } = get()
        const newOverrides = { ...overrides }
        delete newOverrides[flagName]
        set({ overrides: newOverrides })
      },

      getAllFlags: () => {
        const { flags, overrides } = get()
        return Object.entries(flags).map(([key, value]) => ({
          key,
          ...value,
          enabled: overrides[key] !== undefined ? overrides[key] : value.enabled,
          isOverridden: overrides[key] !== undefined,
        }))
      },
    }),
    { name: 'feature-flags' }
  )
)

// HOC for feature flags
export const withFeatureFlag = (flagName, Component, FallbackComponent = null) => {
  return (props) => {
    const { isEnabled } = useFeatureFlags()
    if (!isEnabled(flagName)) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null
    }
    return <Component {...props} />
  }
}

// Hook
export const useFlag = (flagName) => {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(flagName)
}