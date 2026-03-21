// src/components/apps/FeaturedApps.jsx
import React, { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Rating, Button } from '../common'
import { formatNumber } from '../../utils/formatters'

const FeaturedApps = ({ apps }) => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % apps.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + apps.length) % apps.length)
  }

  if (!apps || apps.length === 0) return null

  const currentApp = apps[currentIndex]

  return (
    <div className="relative bg-gradient-to-br from-bg-secondary to-bg rounded-3xl overflow-hidden">
      <div className="relative p-6 md:p-10">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-main/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* App Icon */}
          <div className="w-32 h-32 md:w-48 md:h-48 bg-bg rounded-3xl flex items-center justify-center text-7xl md:text-8xl shadow-lg flex-shrink-0">
            {currentApp.icon}
          </div>

          {/* App Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <Badge variant="primary">⭐ Featured</Badge>
              {currentApp.isNew && <Badge variant="success">NEW</Badge>}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-text mb-2">
              {currentApp.name}
            </h2>

            <p className="text-text-muted text-lg mb-4 max-w-xl">
              {currentApp.description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <Rating value={currentApp.rating} size="lg" />
              <span className="text-text-muted">
                {formatNumber(currentApp.downloads)} downloads
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate(`/app/${currentApp.id}`)}
              >
                View Details
              </Button>
              <Button variant="outline" size="lg">
                Quick Install
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {apps.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-bg/80 rounded-full hover:bg-main hover:text-bg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-bg/80 rounded-full hover:bg-main hover:text-bg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {apps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'w-6 bg-main' 
                      : 'bg-text-muted hover:bg-text'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FeaturedApps