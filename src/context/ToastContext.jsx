// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, 'success'), [addToast])
  const error = useCallback((message) => addToast(message, 'error'), [addToast])
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast])
  const info = useCallback((message) => addToast(message, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-[100] space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const Toast = ({ toast, onClose }) => {
  const types = {
    info: { icon: Info, bg: 'bg-blue-500', border: 'border-blue-400' },
    success: { icon: Check, bg: 'bg-green-500', border: 'border-green-400' },
    warning: { icon: AlertTriangle, bg: 'bg-yellow-500', border: 'border-yellow-400' },
    error: { icon: AlertCircle, bg: 'bg-red-500', border: 'border-red-400' },
  }

  const { icon: Icon, bg, border } = types[toast.type] || types.info

  return (
    <div className={`flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg animate-slide-left border-l-4 ${border} min-w-[280px] max-w-[400px]`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ToastContext