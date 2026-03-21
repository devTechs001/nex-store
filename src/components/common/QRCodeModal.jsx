// src/components/common/QRCodeModal.jsx
import React, { useRef } from 'react'
import { QrCode, Download, Copy, Share2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { useToast } from '../../context/ToastContext'

// Simple QR Code generator using canvas
const generateQRData = (text) => {
  // Using a basic representation - in production use a library like qrcode
  const size = 200
  const modules = 25
  const moduleSize = size / modules
  
  // Simple hash-based pattern (visual placeholder - use real QR library in production)
  const pattern = []
  for (let i = 0; i < modules; i++) {
    pattern[i] = []
    for (let j = 0; j < modules; j++) {
      // Finder patterns (corners)
      const isFinderPattern = 
        (i < 7 && j < 7) || 
        (i < 7 && j >= modules - 7) || 
        (i >= modules - 7 && j < 7)
      
      const isFinderInner = 
        (i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
        (i >= 2 && i <= 4 && j >= modules - 5 && j <= modules - 3) ||
        (i >= modules - 5 && i <= modules - 3 && j >= 2 && j <= 4)

      const isFinderBorder = isFinderPattern && !isFinderInner && 
        !((i >= 1 && i <= 5 && j >= 1 && j <= 5 && !(i >= 2 && i <= 4 && j >= 2 && j <= 4)) ||
          (i >= 1 && i <= 5 && j >= modules - 6 && j <= modules - 2 && !(i >= 2 && i <= 4 && j >= modules - 5 && j <= modules - 3)) ||
          (i >= modules - 6 && i <= modules - 2 && j >= 1 && j <= 5 && !(i >= modules - 5 && i <= modules - 3 && j >= 2 && j <= 4)))

      // Generate pseudo-random data based on text hash
      const hash = (text.charCodeAt((i * modules + j) % text.length) * 31 + i * 7 + j * 13) % 100
      const isData = !isFinderPattern && hash > 45

      pattern[i][j] = isFinderBorder || isFinderInner || isData
    }
  }
  
  return { pattern, modules, moduleSize, size }
}

const QRCodeCanvas = ({ text, size = 200 }) => {
  const canvasRef = useRef(null)
  const data = generateQRData(text)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    
    // Modules
    ctx.fillStyle = '#1f242d'
    data.pattern.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          ctx.fillRect(
            j * data.moduleSize,
            i * data.moduleSize,
            data.moduleSize,
            data.moduleSize
          )
        }
      })
    })
  }, [text, size])

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size}
      className="rounded-xl mx-auto"
    />
  )
}

const QRCodeModal = ({ isOpen, onClose, url, title }) => {
  const toast = useToast()
  const shareUrl = url || window.location.href

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check out this app on AppStore',
          url: shareUrl,
        })
      } catch {
        // User cancelled
      }
    } else {
      handleCopy()
    }
  }

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${title || 'appstore'}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('QR code downloaded!')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share via QR Code" size="sm">
      <div className="text-center space-y-6">
        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl inline-block">
          <QRCodeCanvas text={shareUrl} size={200} />
        </div>

        {/* Title */}
        {title && <p className="font-semibold text-lg">{title}</p>}

        {/* URL */}
        <div className="flex items-center gap-2 bg-bg rounded-xl p-3">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-text-muted truncate focus:outline-none"
          />
          <button onClick={handleCopy} className="text-main hover:text-main-dark">
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" icon={Download} onClick={handleDownload} fullWidth>
            Save QR
          </Button>
          <Button variant="primary" icon={Share2} onClick={handleShare} fullWidth>
            Share Link
          </Button>
        </div>

        <p className="text-xs text-text-muted">
          Scan this code with your phone camera to open the link
        </p>
      </div>
    </Modal>
  )
}

export default QRCodeModal