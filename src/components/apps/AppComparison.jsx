// src/components/apps/AppComparison.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, Minus, Plus, Search } from 'lucide-react'
import { useAppStore } from '../../store'
import { Button, Input, Modal, Rating, Badge } from '../common'
import { getCategoryById } from '../../data/categories'
import { getLanguageById } from '../../data/languages'
import { formatNumber } from '../../utils/formatters'

const AppComparison = ({ isOpen, onClose, initialApps = [] }) => {
  const { apps } = useAppStore()
  const [selectedApps, setSelectedApps] = useState(initialApps.slice(0, 3))
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = apps.filter(app =>
    !selectedApps.some(s => s.id === app.id) &&
    (app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5)

  const addApp = (app) => {
    if (selectedApps.length < 3) {
      setSelectedApps([...selectedApps, app])
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const removeApp = (appId) => {
    setSelectedApps(selectedApps.filter(a => a.id !== appId))
  }

  const comparisonFields = [
    {
      label: 'Rating',
      render: (app) => <Rating value={app.rating} size="sm" />,
    },
    {
      label: 'Downloads',
      render: (app) => <span>{formatNumber(app.downloads)}</span>,
    },
    {
      label: 'Size',
      render: (app) => <span>{app.size}</span>,
    },
    {
      label: 'Version',
      render: (app) => <Badge variant="outline" size="xs">v{app.version}</Badge>,
    },
    {
      label: 'Category',
      render: (app) => <span>{getCategoryById(app.category)?.name}</span>,
    },
    {
      label: 'Language',
      render: (app) => {
        const lang = getLanguageById(app.language)
        return <span>{lang?.icon} {lang?.name}</span>
      },
    },
    {
      label: 'License',
      render: (app) => <span>{app.license}</span>,
    },
    {
      label: 'Price',
      render: (app) => (
        <Badge variant={app.price === 'Free' ? 'success' : 'warning'} size="xs">
          {app.price}
        </Badge>
      ),
    },
    {
      label: 'Verified',
      render: (app) => app.isVerified
        ? <Check className="w-5 h-5 text-green-400" />
        : <Minus className="w-5 h-5 text-text-muted" />,
    },
    {
      label: 'Features',
      render: (app) => (
        <div className="space-y-1">
          {app.features?.slice(0, 4).map((f, i) => (
            <div key={i} className="flex items-center gap-1 text-sm">
              <Check className="w-3 h-3 text-main" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'Platforms',
      render: (app) => (
        <div className="flex flex-wrap gap-1">
          {app.platforms?.map(p => (
            <Badge key={p} size="xs">{p}</Badge>
          ))}
        </div>
      ),
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare Apps" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 w-32 font-medium text-text-muted sticky left-0 bg-bg-secondary">
                Feature
              </th>
              {selectedApps.map(app => (
                <th key={app.id} className="text-center py-4 px-4 min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => removeApp(app.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl">
                        {app.icon}
                      </div>
                      <span className="font-semibold">{app.name}</span>
                      <span className="text-sm text-text-muted">{app.developer}</span>
                    </div>
                  </div>
                </th>
              ))}

              {/* Add App Slot */}
              {selectedApps.length < 3 && (
                <th className="text-center py-4 px-4 min-w-[200px]">
                  {showSearch ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Search apps..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {searchQuery && (
                        <div className="bg-bg rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                          {searchResults.map(app => (
                            <button
                              key={app.id}
                              onClick={() => addApp(app)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-bg-secondary transition-colors text-left"
                            >
                              <span className="text-xl">{app.icon}</span>
                              <div>
                                <p className="font-medium text-sm">{app.name}</p>
                                <p className="text-xs text-text-muted">{app.developer}</p>
                              </div>
                            </button>
                          ))}
                          {searchResults.length === 0 && (
                            <p className="p-3 text-sm text-text-muted text-center">No results</p>
                          )}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowSearch(false); setSearchQuery('') }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="w-16 h-16 mx-auto border-2 border-dashed border-bg rounded-xl flex items-center justify-center hover:border-main transition-colors"
                    >
                      <Plus className="w-6 h-6 text-text-muted" />
                    </button>
                  )}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map(({ label, render }) => (
              <tr key={label} className="border-t border-bg">
                <td className="py-4 px-4 font-medium text-text-muted text-sm sticky left-0 bg-bg-secondary">
                  {label}
                </td>
                {selectedApps.map(app => (
                  <td key={app.id} className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center">
                      {render(app)}
                    </div>
                  </td>
                ))}
                {selectedApps.length < 3 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">Add apps to compare their features</p>
        </div>
      )}
    </Modal>
  )
}

export default AppComparison