import { useState, useCallback } from 'react'

export const useImagePreview = () => {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generatePreview = useCallback((file) => {
    if (!file) return null

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
        setLoading(false)
        resolve(e.target.result)
      }
      reader.onerror = (e) => {
        setError(e.target.error)
        setLoading(false)
        reject(e.target.error)
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const clearPreview = useCallback(() => {
    setPreview(null)
    setError(null)
    setLoading(false)
  }, [])

  return { preview, loading, error, generatePreview, clearPreview }
}

export default useImagePreview
