// src/components/upload/UploadProgress.jsx
import React from 'react'
import { Check, AlertCircle, RefreshCw, Package } from 'lucide-react'
import { Progress, Button } from '../common'

const UploadProgress = ({
  status = 'idle', // idle, validating, uploading, processing, complete, error
  progress = 0,
  currentStep = '',
  errorMessage = '',
  onRetry,
  onCancel,
  onDone,
}) => {
  const steps = [
    { id: 'validate', label: 'Validating files' },
    { id: 'upload', label: 'Uploading' },
    { id: 'process', label: 'Processing' },
    { id: 'complete', label: 'Complete' },
  ]

  const getStepStatus = (stepId) => {
    const stepOrder = ['validate', 'upload', 'process', 'complete']
    const statusOrder = ['validating', 'uploading', 'processing', 'complete']
    const currentIndex = statusOrder.indexOf(status)
    const stepIndex = stepOrder.indexOf(stepId)

    if (status === 'error') return stepIndex <= statusOrder.indexOf(currentStep) ? 'error' : 'pending'
    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  if (status === 'idle') return null

  return (
    <div className="card space-y-6">
      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const stepStatus = getStepStatus(step.id)
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${stepStatus === 'complete' ? 'bg-green-500 text-white' :
                    stepStatus === 'active' ? 'bg-main text-bg animate-pulse' :
                    stepStatus === 'error' ? 'bg-red-500 text-white' :
                    'bg-bg-secondary text-text-muted'
                  }
                `}>
                  {stepStatus === 'complete' ? <Check className="w-5 h-5" /> :
                   stepStatus === 'error' ? <AlertCircle className="w-5 h-5" /> :
                   stepStatus === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                   <span className="text-sm font-bold">{i + 1}</span>
                  }
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  stepStatus === 'active' ? 'text-main' :
                  stepStatus === 'complete' ? 'text-green-400' :
                  'text-text-muted'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  getStepStatus(steps[i + 1].id) !== 'pending'
                    ? 'bg-main'
                    : 'bg-bg-secondary'
                }`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Progress Bar */}
      {status === 'uploading' && (
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-text-muted">Uploading...</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} variant="gradient" size="md" />
        </div>
      )}

      {/* Status Message */}
      {status === 'validating' && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl">
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-blue-400">Validating your files...</span>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex items-center gap-3 p-4 bg-main/10 rounded-xl">
          <RefreshCw className="w-5 h-5 text-main animate-spin" />
          <span className="text-main">Processing your app...</span>
        </div>
      )}

      {status === 'complete' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-green-400 mb-2">Upload Complete!</h3>
          <p className="text-text-muted mb-4">Your app has been submitted for review.</p>
          <Button variant="primary" icon={Package} onClick={onDone}>
            View Your App
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Upload Failed</h3>
          <p className="text-text-muted mb-4">{errorMessage || 'Something went wrong. Please try again.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button variant="primary" icon={RefreshCw} onClick={onRetry}>
              Retry Upload
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {(status === 'uploading' || status === 'validating') && (
        <div className="text-center">
          <Button variant="ghost" onClick={onCancel}>Cancel Upload</Button>
        </div>
      )}
    </div>
  )
}

export default UploadProgress