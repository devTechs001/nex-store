// src/components/apps/InstallationProgress.jsx
import React from 'react'
import { Check, Loader, AlertCircle, Play, Trash2 } from 'lucide-react'
import { Button, Badge } from '../common'
import { installationManager } from '../../services/installationManager'

const InstallationProgress = ({ installations, onInstallComplete }) => {
  const activeInstallations = installations.filter(i => 
    i.status === 'installing' || i.status === 'pending'
  )

  if (activeInstallations.length === 0) return null

  return (
    <div className="fixed bottom-48 right-4 z-30 w-96 max-h-80 overflow-y-auto space-y-2">
      {activeInstallations.map(installation => (
        <InstallationItem
          key={installation.id}
          installation={installation}
          onComplete={onInstallComplete}
        />
      ))}
    </div>
  )
}

const InstallationItem = ({ installation, onComplete }) => {
  const isInstalling = installation.status === 'installing'
  const stageLabel = installationManager.getStageLabel(installation.stage)

  const handleLaunch = () => {
    const result = installationManager.launch(installation.id)
    if (result.success) {
      onInstallComplete?.(installation.id)
    }
  }

  const handleUninstall = () => {
    installationManager.uninstall(installation.id)
  }

  return (
    <div className="bg-bg-secondary rounded-xl p-4 shadow-lg border border-bg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-xl flex-shrink-0 relative">
          {installation.app.icon}
          {isInstalling && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/80 rounded-lg">
              <Loader className="w-5 h-5 text-main animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{installation.app.name}</h4>
          <p className="text-xs text-text-muted">{stageLabel}</p>
        </div>
        {installation.status === 'installed' && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={Play} onClick={handleLaunch} />
            <Button variant="ghost" size="sm" icon={Trash2} onClick={handleUninstall} className="text-red-400" />
          </div>
        )}
      </div>

      {/* Progress */}
      {isInstalling && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Installing...</span>
            <span className="text-main font-medium">{Math.round(installation.progress)}%</span>
          </div>

          <div className="h-2 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-main transition-all duration-300"
              style={{ width: `${installation.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Installed state */}
      {installation.status === 'installed' && (
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <Check className="w-4 h-4" />
          <span>Installed successfully</span>
        </div>
      )}
    </div>
  )
}

export default InstallationProgress
