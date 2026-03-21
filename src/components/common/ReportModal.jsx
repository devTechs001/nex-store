// src/components/common/ReportModal.jsx
import React, { useState } from 'react'
import { Flag, AlertTriangle, Send } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { useToast } from '../../context/ToastContext'

const REPORT_REASONS = [
  { id: 'malware', label: 'Malware or virus', icon: '🦠' },
  { id: 'spam', label: 'Spam or misleading', icon: '📧' },
  { id: 'copyright', label: 'Copyright infringement', icon: '©️' },
  { id: 'inappropriate', label: 'Inappropriate content', icon: '🔞' },
  { id: 'broken', label: 'App is broken/not working', icon: '💔' },
  { id: 'fake', label: 'Fake or misleading description', icon: '🎭' },
  { id: 'privacy', label: 'Privacy concern', icon: '🔒' },
  { id: 'other', label: 'Other', icon: '📝' },
]

const ReportModal = ({ isOpen, onClose, itemType = 'app', itemName = '' }) => {
  const toast = useToast()
  const [selectedReason, setSelectedReason] = useState('')
  const [details, setDetails] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReason) {
      toast.error('Please select a reason')
      return
    }

    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitting(false)
    setSubmitted(true)
    toast.success('Report submitted. Thank you!')
  }

  const handleClose = () => {
    setSelectedReason('')
    setDetails('')
    setEmail('')
    setSubmitted(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Report ${itemType}`} size="md">
      {submitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Report Submitted</h3>
          <p className="text-text-muted mb-6">
            Thank you for your report. Our team will review "{itemName}" shortly.
          </p>
          <Button variant="primary" onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">Report: {itemName}</p>
              <p className="text-sm text-text-muted">
                Please provide accurate information. False reports may result in action against your account.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Why are you reporting this {itemType}?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm
                    ${selectedReason === reason.id
                      ? 'bg-main/20 border-2 border-main text-main'
                      : 'bg-bg border-2 border-transparent hover:border-main/30'
                    }
                  `}
                >
                  <span className="text-lg">{reason.icon}</span>
                  <span className="font-medium">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional details {selectedReason === 'other' ? '(required)' : '(optional)'}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about your report..."
              className="input resize-none h-24"
              required={selectedReason === 'other'}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your email (optional - for follow-up)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-bg">
            <Button variant="ghost" type="button" onClick={handleClose} fullWidth>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              type="submit" 
              icon={Send} 
              loading={submitting}
              fullWidth
              disabled={!selectedReason}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default ReportModal