// src/components/common/Badge.jsx
import React from 'react'

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  dot = false,
  className = '' 
}) => {
  const variants = {
    default: 'bg-bg-secondary text-text',
    primary: 'bg-main text-bg',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    outline: 'border border-main text-main bg-transparent',
    ghost: 'bg-main/20 text-main',
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium 
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {dot && (
        <span className={`w-2 h-2 rounded-full ${
          variant === 'primary' ? 'bg-bg' : 'bg-current'
        }`} />
      )}
      {children}
    </span>
  )
}

export default Badge