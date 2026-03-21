// src/hooks/useToast.js
import { useState, useCallback } from 'react'

const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])
  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    info,
    success,
    warning,
    error,
  }
}

export default useToast
