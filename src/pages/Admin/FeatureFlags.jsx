// src/pages/Admin/FeatureFlags.jsx
import React from 'react'
import { Flag, RefreshCw, AlertTriangle, Check, X, FlaskConical } from 'lucide-react'
import { useFeatureFlags } from '../../services/featureFlags'
import { useToast } from '../../context/ToastContext'
import { Button, Badge } from '../../components/common'

const FeatureFlags = () => {
  const toast = useToast()
  const { getAllFlags, toggle, resetAll, resetFlag } = useFeatureFlags()
  const flags = getAllFlags()

  const categories = {
    ui: flags.filter(f => ['dark-mode', 'animations', 'command-palette', 'chat-widget', 'feedback-widget', 'cookie-consent', 'onboarding', 'pwa-install'].includes(f.key)),
    core: flags.filter(f => ['app-comparison', 'app-bundles', 'collections', 'qr-sharing', 'achievements', 'beta-program', 'app-requests', 'developer-dashboard'].includes(f.key)),
    experimental: flags.filter(f => ['ai-recommendations', 'voice-search', 'ar-preview', 'social-features', 'live-collaboration'].includes(f.key)),
  }

  const handleToggle = (flagKey) => {
    toggle(flagKey)
    toast.success(`Feature flag "${flagKey}" toggled`)
  }

  const handleResetAll = () => {
    resetAll()
    toast.success('All feature flags reset to defaults')
  }

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-main' : 'bg-bg'
      }`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
        enabled ? 'left-7' : 'left-1'
      }`} />
    </button>
  )

  const FlagSection = ({ title, icon: Icon, flags: sectionFlags, color }) => (
    <div className="card mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`w-6 h-6 ${color}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge size="xs">{sectionFlags.filter(f => f.enabled).length}/{sectionFlags.length}</Badge>
      </div>
      <div className="space-y-4">
        {sectionFlags.map((flag) => (
          <div key={flag.key} className="flex items-center justify-between py-3 border-b border-bg last:border-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium font-mono text-sm">{flag.key}</p>
                {flag.isOverridden && (
                  <Badge variant="warning" size="xs">
                    Overridden
                    <button
                      onClick={() => { resetFlag(flag.key); toast.info('Reset to default') }}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <p className="text-sm text-text-muted">{flag.description}</p>
            </div>
            <Toggle enabled={flag.enabled} onChange={() => handleToggle(flag.key)} />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Flag className="w-8 h-8 text-main" />
            Feature Flags
          </h1>
          <p className="text-text-muted">Toggle features on/off for testing</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={handleResetAll}>
          Reset All
        </Button>
      </div>

      <FlagSection title="UI Features" icon={Check} flags={categories.ui} color="text-main" />
      <FlagSection title="Core Features" icon={Flag} flags={categories.core} color="text-green-400" />
      <FlagSection title="Experimental" icon={FlaskConical} flags={categories.experimental} color="text-purple-400" />

      <div className="card border-2 border-yellow-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-500">Development Only</p>
            <p className="text-sm text-text-muted">
              Feature flags are for development and testing purposes. In production, 
              flags should be managed through your CI/CD pipeline or feature management service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureFlags