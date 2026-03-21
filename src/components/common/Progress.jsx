// src/components/common/Progress.jsx
import React from 'react'

const Progress = ({ 
  value = 0, 
  max = 100, 
  size = 'md',
  showLabel = false,
  label,
  variant = 'default',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  }

  const variants = {
    default: 'bg-main',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-main to-purple-500',
  }

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-muted">{label}</span>
          {showLabel && (
            <span className="text-sm font-medium text-text">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-bg rounded-full overflow-hidden ${sizes[size]}`}>
        <div 
          className={`${sizes[size]} ${variants[variant]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default Progress