// src/services/storage.js
class StorageService {
  constructor(prefix = 'appstore_') {
    this.prefix = prefix
  }

  _getKey(key) {
    return `${this.prefix}${key}`
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this._getKey(key))
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._getKey(key), JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._getKey(key))
      return true
    } catch {
      return false
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch {
      return false
    }
  }

  has(key) {
    return localStorage.getItem(this._getKey(key)) !== null
  }

  getStorageSize() {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(this.prefix)) {
        total += localStorage.getItem(key).length * 2 // UTF-16
      }
    }
    return total
  }

  getFormattedSize() {
    const bytes = this.getStorageSize()
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const storage = new StorageService()
export default storage