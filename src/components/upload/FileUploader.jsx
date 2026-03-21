// src/components/upload/FileUploader.jsx
import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, FileText, Archive, Check } from 'lucide-react'
import { Badge, Progress } from '../common'
import { formatFileSize } from '../../utils/formatters'

const FileUploader = ({
  accept = '*',
  maxSize = 500 * 1024 * 1024, // 500MB
  maxFiles = 1,
  multiple = false,
  onFilesChange,
  label = 'Upload Files',
  description = 'Drag & drop or click to browse',
  variant = 'default', // default, compact, image
}) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return Archive
    if (type.includes('text') || type.includes('pdf')) return FileText
    return File
  }

  const validateFile = (file) => {
    const errors = []
    if (file.size > maxSize) {
      errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`)
    }
    return errors
  }

  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles)
    const allErrors = []
    const validFiles = []

    fileArray.forEach(file => {
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        allErrors.push(...fileErrors)
      } else {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          progress: 0,
          status: 'ready', // ready, uploading, complete, error
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        })
      }
    })

    setErrors(allErrors)

    const updatedFiles = multiple
      ? [...files, ...validFiles].slice(0, maxFiles)
      : validFiles.slice(0, 1)

    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }, [files, maxFiles, maxSize, multiple, onFilesChange])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const simulateUpload = (fileId) => {
    setFiles(prev =>
      prev.map(f =>
        f.id === fileId ? { ...f, status: 'uploading' } : f
      )
    )

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, progress: 100, status: 'complete' } : f
          )
        )
      } else {
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, progress } : f
          )
        )
      }
    }, 200)
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrag={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${variant === 'compact' ? 'p-4' : 'p-8'}
          ${isDragging
            ? 'border-main bg-main/10 scale-[1.02]'
            : 'border-bg-secondary hover:border-main/50 hover:bg-bg/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="text-center">
          <div className={`
            mx-auto rounded-full bg-main/20 flex items-center justify-center mb-3
            ${variant === 'compact' ? 'w-10 h-10' : 'w-16 h-16'}
          `}>
            <Upload className={`text-main ${variant === 'compact' ? 'w-5 h-5' : 'w-8 h-8'}`} />
          </div>
          <p className="font-medium text-text mb-1">{label}</p>
          <p className="text-sm text-text-muted">{description}</p>
          <p className="text-xs text-text-muted mt-2">
            Max {formatFileSize(maxSize)} per file
            {multiple && ` • Up to ${maxFiles} files`}
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, i) => (
            <div key={i} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => {
            const FileIcon = getFileIcon(fileItem.file.type)
            return (
              <div
                key={fileItem.id}
                className="flex items-center gap-4 p-3 bg-bg rounded-xl"
              >
                {/* Preview or Icon */}
                {fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-bg-secondary flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-main" />
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{fileItem.file.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {formatFileSize(fileItem.file.size)}
                    </span>
                    {fileItem.status === 'complete' && (
                      <Badge variant="success" size="xs">
                        <Check className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    {fileItem.status === 'uploading' && (
                      <Badge variant="info" size="xs">Uploading...</Badge>
                    )}
                  </div>
                  {fileItem.status === 'uploading' && (
                    <Progress value={fileItem.progress} size="sm" className="mt-2" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {fileItem.status === 'ready' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); simulateUpload(fileItem.id) }}
                      className="p-2 hover:bg-bg-secondary rounded-lg text-main transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(fileItem.id) }}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUploader