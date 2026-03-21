// src/components/common/Input.jsx
import React, { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  icon: Icon,
  error,
  helper,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-text mb-2">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        )}
        <input
          ref={ref}
          className={`
            input
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helper && !error && <p className="mt-1 text-sm text-text-muted">{helper}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input