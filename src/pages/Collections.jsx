// src/pages/Collections.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Plus, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useAppStore } from '../store'
import { useToast } from '../context/ToastContext'
import { Button, Modal, Input, EmptyState, Dropdown, Badge } from '../components/common'

const Collections = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { collections, createCollection, deleteCollection } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const handleCreate = () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }
    createCollection(newCollectionName.trim())
    setNewCollectionName('')
    setShowCreate(false)
    toast.success('Collection created!')
  }

  const handleDelete = (collection) => {
    if (collection.isDefault) {
      toast.error('Cannot delete default collection')
      return
    }
    deleteCollection(collection.id)
    toast.success('Collection deleted')
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="title mb-0">Collections</h1>
        <Button variant="primary" icon={Plus} onClick={() => setShowCreate(true)}>
          New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create collections to organize your favorite apps"
          action={() => setShowCreate(true)}
          actionLabel="Create Collection"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div 
              key={collection.id}
              className="card card-hover cursor-pointer group"
              onClick={() => navigate(`/collections/${collection.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-main/20 flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-main" />
                </div>
                <Dropdown
                  align="right"
                  trigger={
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-bg rounded-lg transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                >
                  <Dropdown.Item icon={Edit}>Rename</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    icon={Trash2} 
                    danger 
                    disabled={collection.isDefault}
                    onClick={() => handleDelete(collection)}
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              </div>

              <h3 className="text-lg font-semibold mb-1">
                {collection.name}
                {collection.isDefault && (
                  <Badge variant="ghost" size="xs" className="ml-2">Default</Badge>
                )}
              </h3>
              <p className="text-sm text-text-muted">
                {collection.apps.length} {collection.apps.length === 1 ? 'app' : 'apps'}
              </p>

              {/* Preview */}
              {collection.apps.length > 0 && (
                <div className="flex -space-x-2 mt-4">
                  {collection.apps.slice(0, 4).map((app, i) => (
                    <div 
                      key={app.id}
                      className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center text-xl border-2 border-bg-secondary"
                    >
                      {app.icon}
                    </div>
                  ))}
                  {collection.apps.length > 4 && (
                    <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center text-sm font-medium border-2 border-bg-secondary">
                      +{collection.apps.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Collection"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Collection Name"
            placeholder="My Awesome Collection"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowCreate(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} fullWidth>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Collections