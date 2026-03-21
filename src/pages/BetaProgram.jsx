// src/pages/BetaProgram.jsx
import React, { useState } from 'react'
import { 
  FlaskConical, Shield, Bug, Sparkles, Users, 
  Check, AlertTriangle, ChevronRight, Star 
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useLocalStorage } from '../hooks'
import { Button, Badge, Input, Progress } from '../components/common'

const BetaProgram = () => {
  const toast = useToast()
  const [isEnrolled, setIsEnrolled] = useLocalStorage('betaEnrolled', false)
  const [email, setEmail] = useState('')

  const handleEnroll = () => {
    setIsEnrolled(true)
    toast.success('Welcome to the Beta Program! 🎉')
  }

  const handleUnenroll = () => {
    setIsEnrolled(false)
    toast.info('You have left the Beta Program')
  }

  const betaApps = [
    { name: 'AppStore v2.0', status: 'testing', progress: 75, testers: 234, bugs: 12, icon: '🏪' },
    { name: 'CodeSync IDE v6.0', status: 'testing', progress: 60, testers: 189, bugs: 8, icon: '💻' },
    { name: 'Terminal++ v5.0', status: 'upcoming', progress: 30, testers: 0, bugs: 0, icon: '🖥️' },
  ]

  const benefits = [
    { icon: Sparkles, title: 'Early Access', description: 'Try new features before anyone else' },
    { icon: Bug, title: 'Report Bugs', description: 'Help us improve by finding and reporting issues' },
    { icon: Star, title: 'Exclusive Badge', description: 'Get a special Beta Tester badge on your profile' },
    { icon: Users, title: 'Community', description: 'Join the beta tester community and provide feedback' },
  ]

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-float">
          <FlaskConical className="w-12 h-12 text-purple-400" />
        </div>
        <Badge variant="ghost" size="md" className="mb-4">
          <FlaskConical className="w-4 h-4 mr-1" />
          Beta Program
        </Badge>
        <h1 className="text-4xl font-bold mb-4">Shape the Future</h1>
        <p className="text-xl text-text-muted max-w-xl mx-auto mb-8">
          Join our Beta Program and be the first to try new features, provide feedback, and help build a better AppStore.
        </p>

        {isEnrolled ? (
          <div className="inline-flex items-center gap-3 bg-green-500/20 text-green-400 px-6 py-3 rounded-xl">
            <Check className="w-5 h-5" />
            <span className="font-semibold">You're enrolled in the Beta Program!</span>
          </div>
        ) : (
          <Button variant="primary" size="lg" icon={FlaskConical} onClick={handleEnroll}>
            Join Beta Program
          </Button>
        )}
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-text-muted">{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Beta Apps */}
      {isEnrolled && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Beta Apps Available</h2>
          <div className="space-y-4">
            {betaApps.map((app) => (
              <div key={app.name} className="card">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-bg rounded-xl flex items-center justify-center text-2xl">
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{app.name}</h3>
                      <Badge 
                        variant={app.status === 'testing' ? 'warning' : 'default'} 
                        size="xs"
                      >
                        {app.status === 'testing' ? '🧪 Testing' : '📅 Upcoming'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span>{app.testers} testers</span>
                      <span>{app.bugs} bugs reported</span>
                    </div>
                    <Progress value={app.progress} size="sm" variant="gradient" className="mt-2" />
                    <span className="text-xs text-text-muted">{app.progress}% complete</span>
                  </div>
                  <Button
                    variant={app.status === 'testing' ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={app.status !== 'testing'}
                  >
                    {app.status === 'testing' ? 'Try Beta' : 'Coming Soon'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="card border-2 border-yellow-500/20 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-500 mb-1">Beta Software Warning</h3>
            <p className="text-text-muted text-sm">
              Beta software may contain bugs, crashes, or incomplete features. Use at your own risk.
              Beta features may change or be removed before the final release.
            </p>
          </div>
        </div>
      </div>

      {/* Leave */}
      {isEnrolled && (
        <div className="text-center">
          <Button variant="ghost" onClick={handleUnenroll} className="text-red-400">
            Leave Beta Program
          </Button>
        </div>
      )}
    </div>
  )
}

export default BetaProgram