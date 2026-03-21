// src/pages/CollectionDetail.jsx
import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FolderOpen, Edit, Share2, Trash2 } from 'lucide-react'
import { useAppStore } from '../store'
import { useToast } from '../context/ToastContext'
import { Button, EmptyState, Badge } from '../components/common'
import { AppGrid } from '../components/apps'

const CollectionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { collections, removeFromCollection } = useAppStore()

  const collection = collections.find(c => c.id === parseInt(id))

  if (!collection) {
    return (
      <div className="page-container text-center">
        <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
        <Button variant="primary" onClick={() => navigate('/collections')}>
          View Collections
        </Button>
      </div>
    )
  }

  const handleRemoveApp = (appId) => {
    removeFromCollection(collection.id, appId)
    toast.success('App removed from collection')
  }

  return (
    <div className="page-container">
      {/* Back */}
      <button
        onClick={() => navigate('/collections')}
        className="flex items-center gap-2 text-text-muted hover:text-main transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Collections</span>
      </button>

      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-main/20 flex items-center justify-center">
            <FolderOpen className="w-10 h-10 text-main" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{collection.name}</h1>
              {collection.isDefault && <Badge variant="ghost">Default</Badge>}
            </div>
            <p className="text-text-muted">
              {collection.apps.length} {collection.apps.length === 1 ? 'app' : 'apps'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={Edit}>Edit</Button>
            <Button variant="outline" icon={Share2}>Share</Button>
          </div>
        </div>
      </div>

      {/* Apps */}
      {collection.apps.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="This collection is empty"
          description="Add apps by clicking the heart icon on any app"
          action={() => navigate('/explore')}
          actionLabel="Explore Apps"
        />
      ) : (
        <AppGrid apps={collection.apps} />
      )}
    </div>
  )
}

export default CollectionDetail