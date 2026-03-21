// src/pages/Upload.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, Image, X, Check, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store'
import { useToast } from '../context/ToastContext'
import { Button, Input, Badge, Progress } from '../components/common'
import { CATEGORIES } from '../data/categories'
import { LANGUAGES } from '../data/languages'
import { PLATFORMS } from '../data/platforms'

const Upload = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { uploadApp } = useAppStore()

  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    language: '',
    platforms: [],
    version: '',
    size: '',
    license: '',
    price: 'Free',
    requirements: '',
    features: [''],
    tags: [''],
    icon: '📦',
    screenshots: [],
  })

  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const togglePlatform = (platformId) => {
    const newPlatforms = formData.platforms.includes(platformId)
      ? formData.platforms.filter(p => p !== platformId)
      : [...formData.platforms, platformId]
    updateField('platforms', newPlatforms)
  }

  const addFeature = () => {
    updateField('features', [...formData.features, ''])
  }

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    updateField('features', newFeatures)
  }

  const removeFeature = (index) => {
    updateField('features', formData.features.filter((_, i) => i !== index))
  }

  const addTag = () => {
    updateField('tags', [...formData.tags, ''])
  }

  const updateTag = (index, value) => {
    const newTags = [...formData.tags]
    newTags[index] = value
    updateField('tags', newTags)
  }

  const removeTag = (index) => {
    updateField('tags', formData.tags.filter((_, i) => i !== index))
  }

  const validateStep = (stepNum) => {
    const newErrors = {}
    
    if (stepNum === 1) {
      if (!formData.name.trim()) newErrors.name = 'App name is required'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
      if (!formData.category) newErrors.category = 'Category is required'
    }
    
    if (stepNum === 2) {
      if (!formData.language) newErrors.language = 'Language is required'
      if (formData.platforms.length === 0) newErrors.platforms = 'Select at least one platform'
      if (!formData.version.trim()) newErrors.version = 'Version is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return

    setUploading(true)
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newApp = uploadApp({
      ...formData,
      features: formData.features.filter(f => f.trim()),
      tags: formData.tags.filter(t => t.trim()),
    })

    setUploading(false)
    toast.success('App uploaded successfully!')
    navigate(`/app/${newApp.id}`)
  }

  const icons = ['📦', '🚀', '💻', '🎮', '📊', '🔧', '⚡', '🎨', '📱', '🌐', '🔐', '🤖']

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="title">Upload App</h1>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {['Basic Info', 'Technical Details', 'Media & Features'].map((label, i) => (
            <div 
              key={i}
              className={`flex items-center gap-2 ${
                i + 1 <= step ? 'text-main' : 'text-text-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                i + 1 < step ? 'bg-main text-bg' :
                i + 1 === step ? 'border-2 border-main text-main' :
                'border-2 border-bg-secondary text-text-muted'
              }`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
        <Progress value={(step / 3) * 100} size="sm" variant="gradient" />
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">App Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => updateField('icon', icon)}
                  className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'bg-main text-bg scale-110'
                      : 'bg-bg hover:bg-main/20'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="App Name *"
            placeholder="Enter your app name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />

          <div>
            <label className="block text-sm font-medium text-text mb-2">Short Description *</label>
            <textarea
              placeholder="Brief description of your app (max 150 characters)"
              maxLength={150}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={`input resize-none h-20 ${errors.description ? 'border-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              <p className="text-xs text-text-muted ml-auto">{formData.description.length}/150</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Full Description</label>
            <textarea
              placeholder="Detailed description of your app, features, and use cases..."
              value={formData.longDescription}
              onChange={(e) => updateField('longDescription', e.target.value)}
              className="input resize-none h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => updateField('category', category.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    formData.category === category.id
                      ? 'bg-main text-bg'
                      : 'bg-bg hover:bg-main/20'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Technical Details */}
      {step === 2 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold">Technical Details</h2>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Programming Language *</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => updateField('language', lang.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.language === lang.id
                      ? 'bg-main text-bg'
                      : 'bg-bg hover:bg-main/20'
                  }`}
                >
                  {lang.icon} {lang.name}
                </button>
              ))}
            </div>
            {errors.language && <p className="text-sm text-red-500 mt-1">{errors.language}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Supported Platforms *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.platforms.includes(platform.id)
                      ? 'bg-main text-bg'
                      : 'bg-bg hover:bg-main/20'
                  }`}
                >
                  {platform.icon} {platform.name}
                </button>
              ))}
            </div>
            {errors.platforms && <p className="text-sm text-red-500 mt-1">{errors.platforms}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Version *"
              placeholder="e.g., 1.0.0"
              value={formData.version}
              onChange={(e) => updateField('version', e.target.value)}
              error={errors.version}
            />
            <Input
              label="Size"
              placeholder="e.g., 50 MB"
              value={formData.size}
              onChange={(e) => updateField('size', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="License"
              placeholder="e.g., MIT, GPL, Commercial"
              value={formData.license}
              onChange={(e) => updateField('license', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-text mb-2">Price</label>
              <select
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="input"
              >
                <option value="Free">Free</option>
                <option value="$9.99">$9.99</option>
                <option value="$19.99">$19.99</option>
                <option value="$49.99">$49.99</option>
                <option value="$99.99">$99.99</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">System Requirements</label>
            <textarea
              placeholder="Minimum requirements to run your app..."
              value={formData.requirements}
              onChange={(e) => updateField('requirements', e.target.value)}
              className="input resize-none h-20"
            />
          </div>
        </div>
      )}

      {/* Step 3: Media & Features */}
      {step === 3 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold">Media & Features</h2>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">App Files</label>
            <div className="border-2 border-dashed border-bg-secondary rounded-xl p-8 text-center hover:border-main transition-colors cursor-pointer">
              <UploadIcon className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="font-medium mb-1">Drop your files here or click to browse</p>
              <p className="text-sm text-text-muted">Support for ZIP, TAR, or individual files up to 500MB</p>
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Screenshots</label>
            <div className="border-2 border-dashed border-bg-secondary rounded-xl p-8 text-center hover:border-main transition-colors cursor-pointer">
              <Image className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="font-medium mb-1">Add screenshots</p>
              <p className="text-sm text-text-muted">PNG, JPG up to 5MB each (max 5 images)</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Key Features</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <Button
                      variant="ghost"
                      icon={X}
                      onClick={() => removeFeature(index)}
                      className="text-red-400"
                    />
                  )}
                </div>
              ))}
              <Button variant="ghost" onClick={addFeature} size="sm">
                + Add Feature
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-bg rounded-lg px-3 py-1">
                  <input
                    type="text"
                    placeholder="tag"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    className="bg-transparent w-20 text-sm focus:outline-none"
                  />
                  {formData.tags.length > 1 && (
                    <button onClick={() => removeTag(index)} className="text-text-muted hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="ghost" onClick={addTag} size="sm">
                + Add Tag
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={step === 1 ? () => navigate(-1) : prevStep}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 ? (
          <Button variant="primary" onClick={nextStep}>
            Continue
          </Button>
        ) : (
          <Button 
            variant="primary" 
            icon={UploadIcon}
            onClick={handleSubmit}
            loading={uploading}
          >
            Upload App
          </Button>
        )}
      </div>
    </div>
  )
}

export default Upload