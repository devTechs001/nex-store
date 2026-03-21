// src/components/common/Skeleton.jsx
import React from 'react'

const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  className = '',
  count = 1,
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    avatar: 'rounded-full',
    thumbnail: 'rounded-xl aspect-square',
    card: 'rounded-2xl h-64',
    button: 'h-12 rounded-full',
  }

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`
        bg-bg-secondary animate-shimmer
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
    />
  ))

  return count === 1 ? elements[0] : <div className="space-y-3">{elements}</div>
}

const SkeletonCard = () => (
  <div className="card space-y-4">
    <Skeleton variant="thumbnail" />
    <Skeleton variant="title" width="80%" />
    <Skeleton count={2} />
    <div className="flex gap-2">
      <Skeleton variant="button" width="100%" />
    </div>
  </div>
)

Skeleton.Card = SkeletonCard

export default Skeleton