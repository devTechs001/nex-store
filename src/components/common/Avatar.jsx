// src/components/common/Avatar.jsx
import React from 'react'
import { User } from 'lucide-react'

const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  fallback,
  className = '' 
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-12 h-12',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`
      ${sizes[size]} rounded-full bg-main/20 
      flex items-center justify-center ${className}
    `}>
      {fallback || <User className={`${iconSizes[size]} text-main`} />}
    </div>
  )
}

export default Avatar