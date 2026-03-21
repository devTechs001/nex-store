// src/components/common/EmptyState.jsx
import React from 'react'
import { Package } from 'lucide-react'
import Button from './Button'

const EmptyState = ({
  icon: Icon = Package,
  title = 'No items found',
  description,
  action,
  actionLabel,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-text-muted" />
      </div>
      <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted max-w-md mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <Button variant="primary" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState