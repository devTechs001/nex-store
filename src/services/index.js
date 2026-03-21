// src/services/index.js
export { api, appsApi, usersApi, authApi, reviewsApi, ApiError } from './api'
export { storage } from './storage'
export { analytics } from './analytics'
export { authService } from './authService'
export { downloadManager } from './downloadManager'
export { installationManager } from './installationManager'

// Re-export for convenience
export { default as apiDefault } from './api'
export { default as storageDefault } from './storage'
export { default as analyticsDefault } from './analytics'
export { default as authServiceDefault } from './authService'
export { default as downloadManagerDefault } from './downloadManager'
export { default as installationManagerDefault } from './installationManager'
