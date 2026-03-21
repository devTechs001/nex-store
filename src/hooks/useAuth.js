// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = authService.getCurrentUserSync()
    setUser(storedUser)
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials, options = {}) => {
    const { onSuccess, onError } = options
    
    setLoading(true)
    setError(null)

    try {
      const result = await authService.login(credentials)
      
      if (result.success) {
        setUser(result.user)
        onSuccess?.(result.user)
        return { success: true, user: result.user }
      } else {
        setError(result.error)
        onError?.(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      onError?.(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data, options = {}) => {
    const { onSuccess, onError } = options
    
    setLoading(true)
    setError(null)

    try {
      const result = await authService.register(data)
      
      if (result.success) {
        setUser(result.user)
        onSuccess?.(result.user)
        return { success: true, user: result.user }
      } else {
        setError(result.error)
        onError?.(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      onError?.(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data) => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.updateProfile(data)
      
      if (result.success) {
        setUser(result.user)
        return { success: true, user: result.user }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    try {
      const result = await authService.forgotPassword(email)
      return result
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const resetPassword = useCallback(async (token, password) => {
    try {
      const result = await authService.resetPassword(token, password)
      return result
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const isAuthenticated = authService.isAuthenticated()
  const isAdmin = user?.role === 'admin'

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
  }
}

export default useAuth
