// src/pages/Maintenance.jsx
import React from 'react'
import { Wrench, Clock, Bell } from 'lucide-react'
import { Logo } from '../components/common/Logo'

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-main/10 rounded-full flex items-center justify-center">
          <Wrench className="w-12 h-12 text-main" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-text mb-4">
          Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-xl text-text-muted mb-8">
          We're currently performing scheduled maintenance to improve your experience.
          We'll be back shortly!
        </p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="card text-left">
            <Clock className="w-6 h-6 text-main mb-3" />
            <h3 className="font-semibold mb-1">Expected Duration</h3>
            <p className="text-text-muted">Approximately 30 minutes</p>
          </div>
          <div className="card text-left">
            <Bell className="w-6 h-6 text-main mb-3" />
            <h3 className="font-semibold mb-1">Stay Updated</h3>
            <p className="text-text-muted">Check our status page for updates</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Maintenance Progress</span>
            <span className="text-sm text-main">45%</span>
          </div>
          <div className="h-2 bg-bg rounded-full overflow-hidden">
            <div className="h-full bg-main rounded-full" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Contact */}
        <p className="text-sm text-text-muted mt-8">
          Need urgent assistance?{' '}
          <a href="mailto:support@nexstore.com" className="text-main hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}

export default Maintenance
