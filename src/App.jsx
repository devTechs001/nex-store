// src/App.jsx
import React, { useState, useEffect } from 'react'
import { ToastProvider } from './context/ToastContext'
import { useThemeStore } from './store/useThemeStore'
import AppRoutes from './routes/AppRoutes'
import { SplashScreen } from './components/common/SplashScreen'
import { Onboarding } from './components/onboarding'

function App() {
  const { setTheme, currentTheme } = useThemeStore()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Apply theme on mount
  useEffect(() => {
    setTheme(currentTheme)
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('nexstore-onboarding')
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [setTheme, currentTheme])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  return (
    <ToastProvider>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {!showSplash && !showOnboarding && <AppRoutes />}
    </ToastProvider>
  )
}

export default App
