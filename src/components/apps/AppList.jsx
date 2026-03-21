// src/components/apps/AppList.jsx
import React from 'react'
import { Download, Check } from 'lucide-react'
import { useAppStore } from '../../store'
import { Rating, Badge, Button } from '../common'
import { formatNumber } from '../../utils/formatters'

const AppList = ({ apps, onAppClick }) => {
  const { addToDownloads, downloads } = useAppStore()

  const handleDownload = (e, app) => {
    e.stopPropagation()
    if (!downloads.some(d => d.id === app.id)) {
      addToDownloads(app)
    }
  }

  return (
    <div className="space-y-4">
      {apps.map(app => {
        const isDownloaded = downloads.some(d => d.id === app.id)
        
        return (
          <div
            key={app.id}
            onClick={() => onAppClick(app)}
            className="card flex items-center gap-4 cursor-pointer hover:border-main border-2 border-transparent"
          >
            <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {app.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-text truncate">{app.name}</h3>
                {app.isNew && <Badge variant="primary" size="xs">NEW</Badge>}
                {app.isFeatured && <Badge variant="success" size="xs">⭐ Featured</Badge>}
              </div>
              <p className="text-sm text-text-muted truncate mb-2">{app.description}</p>
              <div className="flex items-center gap-4">
                <Rating value={app.rating} size="sm" />
                <span className="text-sm text-text-muted">{formatNumber(app.downloads)} downloads</span>
                <Badge variant="outline" size="xs">{app.size}</Badge>
              </div>
            </div>
            <Button
              variant={isDownloaded ? 'secondary' : 'primary'}
              size="sm"
              icon={isDownloaded ? Check : Download}
              onClick={(e) => handleDownload(e, app)}
            >
              {isDownloaded ? 'Installed' : 'Get'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export default AppList
