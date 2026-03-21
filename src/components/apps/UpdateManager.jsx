import { useState, useEffect } from 'react'
import { Download, Check, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'

export const UpdateManager = ({ downloads, onUpdateApp, onIgnoreUpdate }) => {
  const [availableUpdates, setAvailableUpdates] = useState([])
  const [checking, setChecking] = useState(false)

  // Simulate checking for updates
  const checkForUpdates = async () => {
    setChecking(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock updates
    const updates = downloads.map(app => ({
      ...app,
      newVersion: `${parseInt(app.version.split('.')[0]) + 1}.0.0`,
      updateSize: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
      releaseNotes: [
        'Performance improvements',
        'Bug fixes',
        'New features added',
      ],
    })).filter(() => Math.random() > 0.5) // Random updates
    
    setAvailableUpdates(updates)
    setChecking(false)
  }

  useEffect(() => {
    checkForUpdates()
  }, [])

  if (downloads.length === 0) {
    return (
      <div className="text-center py-10">
        <Download className="w-12 h-12 mx-auto text-text-muted mb-4" />
        <p className="text-text-muted">No apps installed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Updates</h3>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={checkForUpdates}
          loading={checking}
        >
          Check
        </Button>
      </div>

      {availableUpdates.length > 0 ? (
        <div className="space-y-3">
          {availableUpdates.map(update => (
            <UpdateCard
              key={update.id}
              app={update}
              onUpdate={() => onUpdateApp(update)}
              onIgnore={() => onIgnoreUpdate(update.id)}
            />
          ))}
          <Button
            variant="primary"
            fullWidth
            icon={Download}
            onClick={() => availableUpdates.forEach(u => onUpdateApp(u))}
          >
            Update All ({availableUpdates.length})
          </Button>
        </div>
      ) : (
        <div className="text-center py-10 bg-bg rounded-xl">
          <Check className="w-12 h-12 mx-auto text-main mb-4" />
          <p className="text-text">All apps are up to date!</p>
        </div>
      )}
    </div>
  )
}

const UpdateCard = ({ app, onUpdate, onIgnore }) => {
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setUpdating(false)
    onUpdate()
  }

  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-2xl">
        {app.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{app.name}</h4>
          <Badge variant="primary" size="xs">NEW</Badge>
        </div>
        <p className="text-sm text-text-muted">
          {app.version} → {app.newVersion}
        </p>
        <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {app.updateSize}
          </span>
          <span>{app.releaseNotes?.length || 0} changes</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onIgnore}
        >
          Ignore
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={updating ? RefreshCw : Download}
          onClick={handleUpdate}
          loading={updating}
        >
          {updating ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </div>
  )
}

export default UpdateManager
