// src/components/common/Rating.jsx
import React from 'react'
import { Star } from 'lucide-react'

const Rating = ({ 
  value, 
  showValue = true, 
  size = 'md',
  max = 5,
  onChange,
  readOnly = true,
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readOnly}
          className={`${readOnly ? '' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= value 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-500'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className={`ml-1.5 text-text-muted ${textSizes[size]}`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default Rating