import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { CATEGORIES, LANGUAGES, PLATFORMS } from '../../data/mockData'

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    language: '',
    platforms: [],
    version: '',
    size: '',
    license: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpload({
      ...formData,
      id: Date.now(),
      icon: '📦',
      rating: 0,
      downloads: 0,
      developer: 'You',
      releaseDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      isNew: true,
      isFeatured: false,
      tags: [],
      features: [],
      screenshots: [],
      longDescription: formData.description,
      requirements: 'To be specified',
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New App" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="App Name"
            placeholder="Enter app name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Version"
            placeholder="e.g., 1.0.0"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Description</label>
          <textarea
            placeholder="Describe your app..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:border-main transition-colors min-h-[100px] resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text focus:border-main transition-colors"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text focus:border-main transition-colors"
              required
            >
              <option value="">Select language</option>
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => {
                  const newPlatforms = formData.platforms.includes(platform.id)
                    ? formData.platforms.filter(p => p !== platform.id)
                    : [...formData.platforms, platform.id]
                  setFormData({ ...formData, platforms: newPlatforms })
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  formData.platforms.includes(platform.id)
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {platform.icon} {platform.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="File Size"
            placeholder="e.g., 50 MB"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          />
          <Input
            label="License"
            placeholder="e.g., MIT, GPL, Commercial"
            value={formData.license}
            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            required
          />
        </div>

        <div className="border-2 border-dashed border-bg-secondary rounded-xl p-8 text-center hover:border-main transition-colors cursor-pointer">
          <Upload className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text font-medium mb-1">Drop your files here or click to browse</p>
          <p className="text-sm text-text-muted">Support for ZIP, TAR, or individual files up to 500MB</p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="ghost" type="button" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="primary" type="submit" fullWidth icon={Upload}>
            Upload App
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UploadModal
