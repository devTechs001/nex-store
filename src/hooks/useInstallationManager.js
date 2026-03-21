// src/hooks/useInstallationManager.js
import { useState, useEffect, useCallback } from 'react'
import { installationManager } from '../services/installationManager'

export const useInstallationManager = () => {
  const [installations, setInstallations] = useState([])
  const [installedApps, setInstalledApps] = useState([])

  const refreshInstallations = useCallback(() => {
    setInstallations(installationManager.getAllInstallations())
    setInstalledApps(installationManager.getInstalledApps())
  }, [])

  useEffect(() => {
    refreshInstallations()
  }, [refreshInstallations])

  const install = useCallback(async (app, callbacks = {}) => {
    const { onProgress, onComplete, onError } = callbacks

    const result = await installationManager.install(
      app,
      (progress) => {
        refreshInstallations()
        onProgress?.(progress)
      },
      (complete) => {
        refreshInstallations()
        onComplete?.(complete)
      },
      (error) => {
        refreshInstallations()
        onError?.(error)
      }
    )

    return result
  }, [refreshInstallations])

  const uninstall = useCallback((appId) => {
    const result = installationManager.uninstall(appId)
    refreshInstallations()
    return result
  }, [refreshInstallations])

  const isInstalled = useCallback((appId) => {
    return installationManager.isInstalled(appId)
  }, [])

  const launch = useCallback((appId) => {
    return installationManager.launch(appId)
  }, [])

  const getInstallation = useCallback((appId) => {
    return installationManager.getInstallation(appId)
  }, [])

  const getInstallPath = useCallback((appId) => {
    return installationManager.getInstallPath(appId)
  }, [])

  const checkUpdates = useCallback((availableApps) => {
    return installationManager.checkUpdates(installedApps, availableApps)
  }, [installedApps])

  return {
    installations,
    installedApps,
    install,
    uninstall,
    isInstalled,
    launch,
    getInstallation,
    getInstallPath,
    checkUpdates,
    refreshInstallations,
  }
}

export default useInstallationManager
