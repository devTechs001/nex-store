// src/components/onboarding/OnboardingFlow.jsx
import React, { useState } from 'react'
import {
  Search, Download, Upload, Heart, Star,
  ChevronRight, ChevronLeft, X, Sparkles,
  Shield, Zap, Globe
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common'

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AppStore',
    subtitle: 'Your Universal App Marketplace',
    description: 'Discover, download, and share applications for every platform and programming language.',
    icon: '🏪',
    illustration: Sparkles,
    color: '#0ef',
  },
  {
    id: 'discover',
    title: 'Discover Amazing Apps',
    subtitle: 'Search & Explore',
    description: 'Browse thousands of apps across categories. Use advanced filters to find exactly what you need.',
    icon: '🔍',
    illustration: Search,
    color: '#3b82f6',
    features: ['Smart Search', 'Category Browsing', 'Advanced Filters', 'Recommendations'],
  },
  {
    id: 'download',
    title: 'Download & Install',
    subtitle: 'One Click Away',
    description: 'Install apps instantly. Track your downloads and manage updates all in one place.',
    icon: '⬇️',
    illustration: Download,
    color: '#10b981',
    features: ['Instant Install', 'Auto Updates', 'Download Manager', 'Offline Access'],
  },
  {
    id: 'share',
    title: 'Share Your Creations',
    subtitle: 'Upload & Publish',
    description: 'Built something amazing? Share it with the world. Upload your apps and reach thousands of developers.',
    icon: '🚀',
    illustration: Upload,
    color: '#8b5cf6',
    features: ['Easy Upload', 'Version Control', 'Analytics', 'Developer Dashboard'],
  },
  {
    id: 'community',
    title: 'Join the Community',
    subtitle: 'Connect & Collaborate',
    description: 'Rate apps, write reviews, create collections, and connect with developers worldwide.',
    icon: '🌍',
    illustration: Globe,
    color: '#f59e0b',
    features: ['Reviews & Ratings', 'Collections', 'Favorites', 'Developer Profiles'],
  },
]

const OnboardingFlow = ({ onComplete }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  if (!onComplete) return null

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const isFirst = currentStep === 0
  const IllustrationIcon = step.illustration

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('nexstore-onboarding', 'completed')
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('nexstore-onboarding', 'completed')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[90] bg-bg flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700"
          style={{ backgroundColor: step.color }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 transition-all duration-700"
          style={{ backgroundColor: step.color }}
        />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-0 right-0 flex items-center gap-1 text-text-muted hover:text-main transition-colors"
        >
          Skip <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="text-center pt-8" key={currentStep}>
          {/* Icon */}
          <div className="relative inline-block mb-8">
            <div 
              className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl mx-auto animate-bounce-in"
              style={{ backgroundColor: `${step.color}20` }}
            >
              {step.icon}
            </div>
            <div 
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center animate-float"
              style={{ backgroundColor: step.color }}
            >
              <IllustrationIcon className="w-6 h-6 text-bg" />
            </div>
          </div>

          {/* Text */}
          <div className="animate-slide-up">
            <p 
              className="text-sm font-semibold uppercase tracking-wider mb-2"
              style={{ color: step.color }}
            >
              {step.subtitle}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{step.title}</h1>
            <p className="text-lg text-text-muted max-w-lg mx-auto mb-8">
              {step.description}
            </p>

            {/* Features */}
            {step.features && (
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-8">
                {step.features.map((feature, i) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 bg-bg-secondary rounded-xl p-3 animate-slide-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: step.color }}
                    />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep 
                  ? 'w-8' 
                  : 'w-2 hover:w-4'
              }`}
              style={{ 
                backgroundColor: i === currentStep ? step.color : '#323946',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={ChevronLeft}
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={isFirst}
            className={isFirst ? 'invisible' : ''}
          >
            Back
          </Button>

          <Button
            variant="primary"
            icon={isLast ? Sparkles : ChevronRight}
            iconPosition="right"
            onClick={handleNext}
            size="lg"
            className="min-w-[160px]"
            style={{
              backgroundColor: step.color,
              boxShadow: `0 0 20px ${step.color}50`,
            }}
          >
            {isLast ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow