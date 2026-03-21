import { useState } from 'react'

export const Logo = ({ size = 'md', animated = false, showText = true }) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 'w-20 h-20', text: 'text-3xl' },
    xl: { icon: 'w-32 h-32', text: 'text-4xl' },
  }

  return (
    <div className={`flex items-center gap-3 ${animated ? 'animate-bounce-in' : ''}`}>
      {/* Logo Icon - Modern Store/Bag Design */}
      <div className="relative">
        <svg
          viewBox="0 0 48 48"
          className={`${sizes[size].icon}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--main-color)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--main-color)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Main bag/store shape */}
          <path
            d="M8 16L10 8H38L40 16V40C40 42.2091 38.2091 44 36 44H12C9.79086 44 8 42.2091 8 40V16Z"
            fill="url(#logoGradient)"
            stroke="var(--main-color)"
            strokeWidth="2"
          />
          {/* Handle */}
          <path
            d="M18 8V6C18 3.79086 19.7909 2 22 2H26C28.2091 2 30 3.79086 30 6V8"
            stroke="var(--main-color)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Shine effect */}
          <path
            d="M14 16L16 40H20L18 16H14Z"
            fill="rgba(0,238,255,0.15)"
          />
          {/* N letter on bag */}
          <text
            x="24"
            y="34"
            textAnchor="middle"
            fill="var(--main-color)"
            fontSize="18"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            N
          </text>
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-main/20 blur-xl rounded-full animate-pulse-glow" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={`${sizes[size].text} font-bold tracking-wide`}>
          <span className="text-text">Nex</span>
          <span className="text-main">Store</span>
        </div>
      )}
    </div>
  )
}

export default Logo
