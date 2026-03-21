// src/services/analytics.js
class AnalyticsService {
  constructor() {
    this.events = []
    this.sessionId = this._generateSessionId()
    this.startTime = Date.now()
  }

  _generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  track(event, properties = {}) {
    const eventData = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.pathname,
    }

    this.events.push(eventData)

    // In production, send to analytics endpoint
    if (import.meta.env.PROD) {
      this._send(eventData)
    } else {
      console.log('[Analytics]', event, properties)
    }
  }

  page(pageName, properties = {}) {
    this.track('page_view', { page: pageName, ...properties })
  }

  appView(appId, appName) {
    this.track('app_view', { appId, appName })
  }

  appDownload(appId, appName) {
    this.track('app_download', { appId, appName })
  }

  appFavorite(appId, appName, isFavorite) {
    this.track('app_favorite', { appId, appName, action: isFavorite ? 'add' : 'remove' })
  }

  search(query, resultsCount) {
    this.track('search', { query, resultsCount })
  }

  filterApply(filters) {
    this.track('filter_apply', filters)
  }

  buttonClick(buttonName, context) {
    this.track('button_click', { buttonName, context })
  }

  error(errorMessage, context) {
    this.track('error', { message: errorMessage, context })
  }

  async _send(eventData) {
    try {
      // Replace with actual analytics endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData),
      // })
    } catch (error) {
      console.error('Analytics send failed:', error)
    }
  }

  getSessionDuration() {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  getEventCount() {
    return this.events.length
  }
}

export const analytics = new AnalyticsService()
export default analytics