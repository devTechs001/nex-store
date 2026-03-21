// src/components/common/Dropdown.jsx
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const Dropdown = ({ 
  trigger, 
  children, 
  align = 'left',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`
          absolute top-full mt-2 ${alignments[align]}
          bg-bg-secondary rounded-xl shadow-lg border border-bg
          min-w-[200px] py-2 z-50 animate-slide-down
        `}>
          {typeof children === 'function' 
            ? children({ close: () => setIsOpen(false) })
            : children
          }
        </div>
      )}
    </div>
  )
}

const DropdownItem = ({ 
  children, 
  icon: Icon, 
  onClick, 
  danger = false,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-left
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${danger 
          ? 'text-red-400 hover:bg-red-500/10' 
          : 'text-text hover:bg-bg'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm font-medium">{children}</span>
    </button>
  )
}

const DropdownDivider = () => (
  <div className="my-2 border-t border-bg" />
)

Dropdown.Item = DropdownItem
Dropdown.Divider = DropdownDivider

export default Dropdown