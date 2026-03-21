// src/components/common/Card.jsx
import React from 'react'

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'default',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={`
        bg-bg-secondary rounded-2xl transition-all duration-300
        ${paddings[padding]}
        ${hover ? 'card-hover' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
