// src/components/common/CookieConsent.jsx
import React from 'react'
import { Cookie, Shield, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks'
import Button from './Button'

const CookieConsent = () => {
  const [consent, setConsent] = useLocalStorage('cookieConsent', null)
  const [showDetails, setShowDetails] = React.useState(false)

  if (consent !== null) return null

  const handleAcceptAll = () => {
    setConsent({ essential: true, analytics: true, marketing: true, date: new Date().toISOString() })
  }

  const handleEssentialOnly = () => {
    setConsent({ essential: true, analytics: false, marketing: false, date: new Date().toISOString() })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 lg:pb-4 pb-20">
      <div className="max-w-4xl mx-auto bg-bg-secondary border border-bg rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-main/20 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-main" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">We value your privacy</h3>
              <p className="text-text-muted text-sm mb-4">
                We use cookies to enhance your browsing experience, serve personalized content, 
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>

              {showDetails && (
                <div className="space-y-3 mb-4 p-4 bg-bg rounded-xl animate-slide-down">
                  <CookieOption
                    title="Essential Cookies"
                    description="Required for the website to function properly. Cannot be disabled."
                    required
                    checked
                  />
                  <CookieOption
                    title="Analytics Cookies"
                    description="Help us understand how visitors interact with our website."
                    defaultChecked={false}
                  />
                  <CookieOption
                    title="Marketing Cookies"
                    description="Used to deliver relevant advertisements."
                    defaultChecked={false}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={handleAcceptAll}>
                  Accept All
                </Button>
                <Button variant="outline" onClick={handleEssentialOnly}>
                  Essential Only
                </Button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-main hover:underline"
                >
                  {showDetails ? 'Hide' : 'Cookie'} Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CookieOption = ({ title, description, required = false, checked, defaultChecked }) => {
  const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked ?? true)

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={required ? true : isChecked}
        onChange={() => !required && setIsChecked(!isChecked)}
        disabled={required}
        className="mt-1 w-4 h-4 rounded"
      />
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{title}</p>
          {required && (
            <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded">Required</span>
          )}
        </div>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  )
}

export default CookieConsent