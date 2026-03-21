// src/components/auth/AuthGuard.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { Loader } from '../common'

export const AuthGuard = ({ children, requireAuth = true, requireAdmin = false }) => {
  const location = useLocation()
  const { isAuthenticated, isAdmin } = useAuthStore()

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If admin is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export const AdminGuard = ({ children }) => {
  return <AuthGuard requireAuth requireAdmin>{children}</AuthGuard>
}

export const GuestGuard = ({ children }) => {
  return <AuthGuard requireAuth={false}>{children}</AuthGuard>
}

export default AuthGuard