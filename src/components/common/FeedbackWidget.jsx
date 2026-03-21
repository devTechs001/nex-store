// src/components/common/FeedbackWidget.jsx
import React, { useState } from 'react'
import { MessageSquare, X, Send, Smile, Meh, Frown, ThumbsUp } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Button from './Button'

const FeedbackWidget = () => {
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [rating, setRating] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emotions = [
    { id: 'sad', icon: Frown, label: 'Poor', color: 'text-red-400 hover:text-red-500' },
    { id: 'meh', icon: Meh, label: 'Okay', color: 'text-yellow-400 hover:text-yellow-500' },
    { id: 'happy', icon: Smile, label: 'Great', color: 'text-green-400 hover:text-green-500' },
  ]

  const handleSubmit = () => {
    setSubmitted(true)
    toast.success('Thank you for your feedback!')
    setTimeout(() => {
      setIsOpen(false)
      setStep(1)
      setRating(null)
      setFeedback('')
      setSubmitted(false)
    }, 2000)
  }

  const handleClose = () => {
    setIsOpen(false)
    setStep(1)
    setRating(null)
    setFeedback('')
    setSubmitted(false)
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 lg:bottom-6 left-6 z-[55] flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-bg rounded-full text-sm font-medium hover:border-main transition-colors shadow-lg"
      >
        <MessageSquare className="w-4 h-4 text-main" />
        Feedback
      </button>

      {/* Widget */}
      {isOpen && (
        <div className="fixed bottom-40 lg:bottom-20 left-6 z-[55] w-80 bg-bg-secondary rounded-2xl shadow-2xl border border-bg overflow-hidden animate-bounce-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-bg">
            <h3 className="font-semibold">Send Feedback</h3>
            <button onClick={handleClose} className="p-1 hover:bg-bg rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="w-7 h-7 text-green-500" />
                </div>
                <h4 className="font-semibold mb-1">Thank you!</h4>
                <p className="text-sm text-text-muted">Your feedback helps us improve</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-4">How's your experience?</p>
                    <div className="flex justify-center gap-6">
                      {emotions.map(({ id, icon: Icon, label, color }) => (
                        <button
                          key={id}
                          onClick={() => { setRating(id); setStep(2) }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-110 ${
                            rating === id ? 'bg-main/20' : 'hover:bg-bg'
                          } ${color}`}
                        >
                          <Icon className="w-10 h-10" />
                          <span className="text-xs font-medium text-text">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setStep(1)} className="text-text-muted hover:text-text">
                        ←
                      </button>
                      <p className="text-sm text-text-muted">Tell us more (optional)</p>
                    </div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What can we improve?"
                      className="input resize-none h-24 text-sm"
                      autoFocus
                    />
                    <Button variant="primary" fullWidth icon={Send} onClick={handleSubmit}>
                      Send Feedback
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FeedbackWidget