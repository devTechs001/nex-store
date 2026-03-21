// src/components/common/Loader.jsx
import React from 'react'
import { Loader2 } from 'lucide-react'

const Loader = ({ size = 'md', text, className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} text-main animate-spin`} />
      {text && <p className="text-text-muted text-sm">{text}</p>}
    </div>
  )
}

export default Loader