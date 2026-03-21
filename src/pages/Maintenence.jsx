// src/pages/Maintenance.jsx
import React, { useState, useEffect } from 'react'
import { Wrench, Clock, Mail, Twitter, RefreshCw } from 'lucide-react'
import { Button } from '../components/common'

const Maintenance = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) return { hours: 0, minutes: 0, seconds: 0 }
        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const pad = (n) => n.toString().padStart(2, '0')

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 rounded-full bg-main/20 flex items-center justify-center mx-auto animate-pulse-glow">
            <Wrench className="w-16 h-16 text-main animate-spin-slow" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Under Maintenance
        </h1>
        <p className="text-xl text-text-muted mb-8">
          We're performing scheduled maintenance to improve your experience. We'll be back shortly!
        </p>

        {/* Countdown */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { label: 'Hours', value: pad(timeLeft.hours) },
            { label: 'Minutes', value: pad(timeLeft.minutes) },
            { label: 'Seconds', value: pad(timeLeft.seconds) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg-secondary rounded-2xl p-4 min-w-[80px]">
              <p className="text-3xl font-bold text-main font-mono">{value}</p>
              <p className="text-xs text-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="card inline-flex items-center gap-3 mb-8">
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm">Maintenance in progress</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button variant="primary" icon={RefreshCw} onClick={() => window.location.reload()}>
            Check Again
          </Button>
          <Button variant="outline" icon={Mail}>
            Get Notified
          </Button>
        </div>

        {/* Social */}
        <p className="text-text-muted text-sm">
          Follow us for updates{' '}
          <a href="#" className="text-main hover:underline inline-flex items-center gap-1">
            <Twitter className="w-4 h-4" /> @AppStore
          </a>
        </p>
      </div>
    </div>
  )
}

export default Maintenance