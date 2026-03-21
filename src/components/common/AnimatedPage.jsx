// src/components/common/AnimatedPage.jsx
import React, { useEffect, useState } from 'react'

const AnimatedPage = ({ children, animation = 'fade' }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  const animations = {
    fade: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideLeft: 'animate-slide-left',
    bounceIn: 'animate-bounce-in',
  }

  return (
    <div className={`${isVisible ? animations[animation] : 'opacity-0'}`}>
      {children}
    </div>
  )
}

export default AnimatedPage