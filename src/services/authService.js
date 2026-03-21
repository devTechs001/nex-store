// src/services/authService.js
import { api, authApi } from './api'
import { storage } from './storage'

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token'
    this.refreshTokenKey = 'refresh_token'
    this.userKey = 'auth_user'
  }

  // Get stored token
  getToken() {
    return storage.get(this.tokenKey)
  }

  // Get stored refresh token
  getRefreshToken() {
    return storage.get(this.refreshTokenKey)
  }

  // Get stored user
  getUser() {
    return storage.get(this.userKey)
  }

  // Login
  async login(credentials) {
    try {
      const response = await authApi.login(credentials)
      
      if (response.token) {
        storage.set(this.tokenKey, response.token)
        api.setAuthToken(response.token)
      }
      
      if (response.refreshToken) {
        storage.set(this.refreshTokenKey, response.refreshToken)
      }
      
      if (response.user) {
        storage.set(this.userKey, response.user)
      }

      return { success: true, user: response.user }
    } catch (error) {
      // Fallback to mock login for demo
      return this.mockLogin(credentials)
    }
  }

  // Mock login for demo purposes
  mockLogin(credentials) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: Date.now(),
          email: credentials.email,
          name: credentials.email.split('@')[0],
          avatar: null,
          role: credentials.email.includes('admin') ? 'admin' : 'user',
          joinedAt: new Date().toISOString(),
        }
        
        const token = 'mock_jwt_token_' + Date.now()
        
        storage.set(this.tokenKey, token)
        storage.set(this.userKey, user)
        api.setAuthToken(token)
        
        resolve({ success: true, user })
      }, 1000)
    })
  }

  // Register
  async register(data) {
    try {
      const response = await authApi.register(data)
      
      if (response.token) {
        storage.set(this.tokenKey, response.token)
        api.setAuthToken(response.token)
      }
      
      if (response.user) {
        storage.set(this.userKey, response.user)
      }

      return { success: true, user: response.user }
    } catch (error) {
      // Fallback to mock registration
      return this.mockRegister(data)
    }
  }

  // Mock registration for demo purposes
  mockRegister(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: Date.now(),
          email: data.email,
          name: data.name,
          avatar: null,
          role: 'user',
          joinedAt: new Date().toISOString(),
        }
        
        const token = 'mock_jwt_token_' + Date.now()
        
        storage.set(this.tokenKey, token)
        storage.set(this.userKey, user)
        api.setAuthToken(token)
        
        resolve({ success: true, user })
      }, 1000)
    })
  }

  // Logout
  async logout() {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignore logout errors
    }

    storage.remove(this.tokenKey)
    storage.remove(this.refreshTokenKey)
    storage.remove(this.userKey)
    api.setAuthToken(null)
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await authApi.refreshToken()
      
      if (response.token) {
        storage.set(this.tokenKey, response.token)
        api.setAuthToken(response.token)
      }

      return { success: true }
    } catch (error) {
      // Auto logout on refresh failure
      await this.logout()
      return { success: false, error: 'Session expired' }
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      await authApi.forgotPassword(email)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      await authApi.resetPassword(token, password)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await usersApi.getProfile()
      storage.set(this.userKey, response.user)
      return response.user
    } catch (error) {
      return this.getUser()
    }
  }

  // Update profile
  async updateProfile(data) {
    try {
      const response = await usersApi.updateProfile(data)
      storage.set(this.userKey, response.user)
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser()
  }

  // Get current user (sync)
  getCurrentUserSync() {
    return this.getUser()
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

export const authService = new AuthService()
export default authService
