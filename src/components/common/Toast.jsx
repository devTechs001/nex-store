// src/components/common/Toast.jsx
import React, { useEffect } from 'react'
import { Check, AlertCircle, Info, X } from 'lucide-react'

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const types = {
    info: { icon: Info, bg: 'bg-blue-500' },
    success: { icon: Check, bg: 'bg-green-500' },
    warning: { icon: AlertCircle, bg: 'bg-yellow-500' },
    error: { icon: AlertCircle, bg: 'bg-red-500' },
  }

  const { icon: Icon, bg } = types[type] || types.info

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg animate-slide-up`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Toast
