// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  setAuthToken(token) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`
    } else {
      delete this.headers['Authorization']
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: { ...this.headers, ...options.headers },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        )
      }

      if (response.status === 204) return null
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Network error. Please check your connection.', 0)
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  async upload(endpoint, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${this.baseUrl}${endpoint}`)

      Object.keys(this.headers).forEach(key => {
        if (key !== 'Content-Type') {
          xhr.setRequestHeader(key, this.headers[key])
        }
      })

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100))
          }
        })
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new ApiError(`Upload failed: ${xhr.status}`, xhr.status))
        }
      }

      xhr.onerror = () => reject(new ApiError('Upload failed', 0))
      xhr.send(formData)
    })
  }
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// API endpoints
export const api = new ApiService()

export const appsApi = {
  getAll: (params) => api.get('/apps', params),
  getById: (id) => api.get(`/apps/${id}`),
  create: (data) => api.post('/apps', data),
  update: (id, data) => api.put(`/apps/${id}`, data),
  delete: (id) => api.delete(`/apps/${id}`),
  search: (query) => api.get('/apps/search', { q: query }),
  getByCategory: (category) => api.get(`/apps/category/${category}`),
  getFeatured: () => api.get('/apps/featured'),
  getNew: () => api.get('/apps/new'),
  getTopRated: () => api.get('/apps/top-rated'),
  upload: (formData, onProgress) => api.upload('/apps/upload', formData, onProgress),
}

export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getById: (id) => api.get(`/users/${id}`),
  getAll: (params) => api.get('/users', params),
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

export const reviewsApi = {
  getByApp: (appId) => api.get(`/apps/${appId}/reviews`),
  create: (appId, data) => api.post(`/apps/${appId}/reviews`, data),
  update: (appId, reviewId, data) => api.put(`/apps/${appId}/reviews/${reviewId}`, data),
  delete: (appId, reviewId) => api.delete(`/apps/${appId}/reviews/${reviewId}`),
}

export default api