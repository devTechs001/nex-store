// src/components/apps/AppScreenshots.jsx
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { Modal } from '../common'

const AppScreenshots = ({ screenshots = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(null)

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No screenshots available
      </div>
    )
  }

  const openLightbox = (index) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)
  
  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % screenshots.length)
  }
  
  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <>
      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {screenshots.map((screenshot, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="relative flex-shrink-0 w-72 h-40 rounded-xl overflow-hidden group"
          >
            <img
              src={screenshot}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:text-main transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-2 text-white hover:text-main transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={screenshots[selectedIndex]}
            alt={`Screenshot ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 p-2 text-white hover:text-main transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {selectedIndex + 1} / {screenshots.length}
          </div>
        </div>
      )}
    </>
  )
}

export default AppScreenshots