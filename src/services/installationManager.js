// src/services/installationManager.js
import { storage } from './storage'

class InstallationManager {
  constructor() {
    this.installations = new Map()
    this.storageKey = 'installations'
    this.loadInstallations()
  }

  loadInstallations() {
    const saved = storage.get(this.storageKey, {})
    Object.entries(saved).forEach(([id, installation]) => {
      this.installations.set(id, installation)
    })
  }

  saveInstallations() {
    const installations = {}
    this.installations.forEach((value, key) => {
      installations[key] = value
    })
    storage.set(this.storageKey, installations)
  }

  // Install an app
  install(app, onProgress, onComplete, onError) {
    const installationId = app.id

    const installation = {
      id: installationId,
      app: {
        id: app.id,
        name: app.name,
        icon: app.icon,
        version: app.version,
      },
      status: 'pending',
      progress: 0,
      stage: 'preparing',
      startTime: Date.now(),
      installedAt: null,
      installPath: this.getInstallPath(app),
    }

    this.installations.set(installationId, installation)
    this.saveInstallations()

    // Simulate installation stages
    this.simulateInstallation(installationId, onProgress, onComplete, onError)

    return { success: true, installationId }
  }

  getInstallPath(app) {
    // Simulated install path
    const safeName = app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `/Applications/${safeName}`
  }

  simulateInstallation(installationId, onProgress, onComplete, onError) {
    const installation = this.installations.get(installationId)
    if (!installation) return

    const stages = [
      { name: 'preparing', duration: 1000 },
      { name: 'extracting', duration: 2000 },
      { name: 'copying_files', duration: 3000 },
      { name: 'configuring', duration: 1500 },
      { name: 'finalizing', duration: 500 },
    ]

    let currentStage = 0
    let stageProgress = 0

    const processStage = () => {
      const current = this.installations.get(installationId)
      if (!current || current.status === 'cancelled' || current.status === 'failed') {
        return
      }

      if (currentStage >= stages.length) {
        current.status = 'installed'
        current.progress = 100
        current.installedAt = new Date().toISOString()
        this.saveInstallations()
        onComplete?.(current)
        return
      }

      const stage = stages[currentStage]
      current.stage = stage.name
      stageProgress += 10

      const totalProgress = ((currentStage + stageProgress / 100) / stages.length) * 100
      current.progress = totalProgress

      this.saveInstallations()
      onProgress?.(current)

      if (stageProgress >= 100) {
        currentStage++
        stageProgress = 0
      }

      setTimeout(processStage, stage.duration / 10)
    }

    installation.status = 'installing'
    processStage()
  }

  // Uninstall an app
  uninstall(appId) {
    const installation = this.installations.get(appId)
    if (!installation) return false

    installation.status = 'uninstalling'
    this.saveInstallations()

    // Simulate uninstall
    setTimeout(() => {
      this.installations.delete(appId)
      this.saveInstallations()
    }, 1500)

    return true
  }

  // Get installation status
  getInstallation(appId) {
    return this.installations.get(appId)
  }

  // Check if app is installed
  isInstalled(appId) {
    const installation = this.installations.get(appId)
    return installation?.status === 'installed'
  }

  // Get all installations
  getAllInstallations() {
    return Array.from(this.installations.values())
  }

  // Get installed apps
  getInstalledApps() {
    return this.getAllInstallations().filter(i => i.status === 'installed')
  }

  // Get installing apps
  getInstallingApps() {
    return this.getAllInstallations().filter(i => i.status === 'installing')
  }

  // Get installation stage label
  getStageLabel(stage) {
    const labels = {
      preparing: 'Preparing...',
      extracting: 'Extracting files...',
      copying_files: 'Copying files...',
      configuring: 'Configuring...',
      finalizing: 'Finalizing...',
    }
    return labels[stage] || stage
  }

  // Clear uninstalled entries
  cleanup() {
    this.getAllInstallations()
      .filter(i => i.status === 'uninstalled')
      .forEach(i => this.installations.delete(i.id))
    this.saveInstallations()
  }

  // Get install path for app
  getInstallPath(appId) {
    return this.installations.get(appId)?.installPath || null
  }

  // Launch an installed app
  launch(appId) {
    const installation = this.installations.get(appId)
    if (!installation || installation.status !== 'installed') {
      return { success: false, error: 'App not installed' }
    }

    // Simulate app launch
    return {
      success: true,
      message: `Launching ${installation.app.name}...`,
      path: installation.installPath,
    }
  }

  // Check for updates for installed apps
  checkUpdates(installedApps, availableApps) {
    const updates = []
    
    installedApps.forEach(installed => {
      const available = availableApps.find(a => a.id === installed.id)
      if (available && available.version !== installed.app.version) {
        updates.push({
          ...installed,
          newVersion: available.version,
          currentVersion: installed.app.version,
        })
      }
    })

    return updates
  }
}

export const installationManager = new InstallationManager()
export default installationManager
