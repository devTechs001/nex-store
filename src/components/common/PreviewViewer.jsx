import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize, Download } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export const PreviewViewer = ({ screenshots, appName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  if (!screenshots || screenshots.length === 0) return null

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {screenshots.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === index ? 'border-main' : 'border-transparent hover:border-main/50'
              }`}
            >
              <img
                src={screenshot}
                alt={`${appName} screenshot ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Preview */}
        {screenshots[currentIndex] && (
          <div className="relative">
            <div className={`rounded-2xl overflow-hidden border-2 border-bg ${fullscreen ? 'fixed inset-4 z-50' : ''}`}>
              <img
                src={screenshots[currentIndex]}
                alt={`${appName} preview ${currentIndex + 1}`}
                className="w-full object-contain bg-bg"
                style={{ maxHeight: fullscreen ? '100%' : '400px' }}
              />
              
              {/* Navigation */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={prevImage}
                  className="p-2 bg-bg/80 rounded-full hover:bg-main hover:text-bg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="p-2 bg-bg/80 rounded-full hover:bg-main hover:text-bg transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  className="p-2 bg-bg/80 rounded-full hover:bg-main hover:text-bg transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-bg/80 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-bg/80 rounded-full text-sm">
                {currentIndex + 1} / {screenshots.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// App Preview Modal for quick look
export const AppPreviewModal = ({ app, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`${app.name} - Preview`} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl">
            {app.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{app.name}</h2>
            <p className="text-text-muted">{app.version}</p>
          </div>
        </div>

        {/* Screenshots */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {app.screenshots.map((screenshot, index) => (
              <img
                key={index}
                src={screenshot}
                alt={`Screenshot ${index + 1}`}
                className="w-80 h-48 object-cover rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.size}</p>
            <p className="text-sm text-text-muted">Size</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.rating}</p>
            <p className="text-sm text-text-muted">Rating</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.downloads >= 1000 ? (app.downloads / 1000).toFixed(1) + 'K' : app.downloads}</p>
            <p className="text-sm text-text-muted">Downloads</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.platforms?.length || 0}</p>
            <p className="text-sm text-text-muted">Platforms</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">About</h3>
          <p className="text-text-muted leading-relaxed">{app.longDescription}</p>
        </div>

        {/* Features */}
        {app.features && app.features.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {app.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 bg-bg rounded-xl p-3">
                  <div className="w-2 h-2 bg-main rounded-full" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" fullWidth icon={Download}>
            Download Now
          </Button>
        </div>
      </div>
    </Modal>
  )
}
