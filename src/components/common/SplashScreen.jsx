import { useEffect, useState } from 'react'
import { Logo } from './Logo'

export const SplashScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Start animation
    setStage(1)
    
    const timers = [
      setTimeout(() => setStage(2), 300),
      setTimeout(() => setStage(3), 800),
      setTimeout(() => {
        setVisible(false)
        setTimeout(onComplete, 500)
      }, 2500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-bg transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center px-4">
        {/* Animated Logo Container */}
        <div className={`relative mb-8 transition-all duration-700 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="w-40 h-40 mx-auto bg-gradient-to-br from-main/20 via-main/10 to-transparent rounded-3xl flex items-center justify-center">
            <Logo size="xl" animated={false} showText={false} />
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-main/15 rounded-3xl blur-2xl animate-pulse-glow" />
        </div>

        {/* Title */}
        <h1 className={`text-4xl md:text-5xl font-bold mb-2 transition-all duration-700 ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <span className="text-text">Nex</span>
          <span className="text-main">Store</span>
        </h1>

        {/* Tagline */}
        <p className={`text-text-muted text-lg mb-8 transition-all duration-700 ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          Enterprise App Store
        </p>

        {/* Loading Bar */}
        <div className={`w-48 mx-auto h-1.5 bg-bg-secondary rounded-full overflow-hidden transition-all duration-700 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div
            className="h-full bg-gradient-to-r from-main to-main/60 rounded-full transition-all duration-1000 ease-out"
            style={{ width: stage >= 3 ? '100%' : '40%' }}
          />
        </div>

        {/* Loading text */}
        <p className={`mt-4 text-sm text-text-muted transition-all duration-700 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          {stage < 3 ? 'Loading...' : 'Ready!'}
        </p>
      </div>
    </div>
  )
}
