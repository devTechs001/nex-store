import { useState } from 'react'
import { Beaker, Star, Zap, AlertTriangle } from 'lucide-react'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'

export const BetaProgram = ({ apps, onJoinBeta, onLeaveBeta }) => {
  const [selectedApp, setSelectedApp] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const betaApps = apps.filter(app => app.isBeta || app.hasBetaProgram)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Beta Programs</h3>
        </div>
        <Badge variant="primary" size="sm">
          {betaApps.length} Available
        </Badge>
      </div>

      {betaApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {betaApps.map(app => (
            <BetaCard
              key={app.id}
              app={app}
              onViewDetails={() => {
                setSelectedApp(app)
                setShowModal(true)
              }}
              onJoinBeta={() => onJoinBeta(app)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-bg rounded-xl">
          <Beaker className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-muted mb-2">No beta programs available</p>
          <p className="text-sm text-text-muted">Check back later for new beta opportunities</p>
        </div>
      )}

      {showModal && selectedApp && (
        <BetaDetailsModal
          app={selectedApp}
          onClose={() => setShowModal(false)}
          onJoinBeta={() => {
            onJoinBeta(selectedApp)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

const BetaCard = ({ app, onViewDetails, onJoinBeta }) => {
  const [joined, setJoined] = useState(app.isInBeta || false)

  return (
    <div className="card border border-purple-500/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-transparent rounded-xl flex items-center justify-center text-2xl">
          {app.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{app.name}</h4>
            <Badge variant="outline" size="xs" className="border-purple-500 text-purple-400">
              <Beaker className="w-3 h-3 mr-1" />
              Beta
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">{app.betaVersion || 'v2.0.0-beta'}</p>
          <p className="text-sm text-text-muted mt-2 line-clamp-2">{app.betaDescription || 'Get early access to new features and help shape the future of this app.'}</p>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="text-purple-400 border-purple-500/50"
            >
              Details
            </Button>
            <Button
              variant={joined ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                setJoined(!joined)
                if (!joined) onJoinBeta()
              }}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {joined ? 'Leave Beta' : 'Join Beta'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const BetaDetailsModal = ({ app, onClose, onJoinBeta }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Beta Program" size="md">
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-500">Beta Software Warning</h4>
            <p className="text-sm text-text-muted mt-1">
              Beta versions may be unstable, contain bugs, or cause data loss. 
              Use at your own risk and not on production systems.
            </p>
          </div>
        </div>

        {/* App Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl">
            {app.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold">{app.name}</h3>
            <p className="text-text-muted">Beta Version: {app.betaVersion || '2.0.0-beta'}</p>
          </div>
        </div>

        {/* What's New */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            What's New in Beta
          </h4>
          <ul className="space-y-2">
            {(app.betaFeatures || [
              'Redesigned user interface',
              'Improved performance by 40%',
              'New dark mode theme',
              'Enhanced security features',
              'Bug fixes and stability improvements',
            ]).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Star className="w-4 h-4 text-main flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div className="bg-bg rounded-xl p-4">
          <h4 className="font-semibold mb-2">Requirements</h4>
          <div className="text-sm text-text-muted space-y-1">
            <p>• Compatible with {app.platforms?.join(', ') || 'all platforms'}</p>
            <p>• Requires {app.betaRequirements || 'latest OS version'}</p>
            <p>• Feedback required through in-app reporting</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="ghost" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={onJoinBeta} 
            fullWidth
            icon={Beaker}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Join Beta Program
          </Button>
        </div>
      </div>
    </Modal>
  )
}
