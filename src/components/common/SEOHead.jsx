// src/components/common/SEOHead.jsx
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SEOHead = ({ 
  title, 
  description, 
  image,
  type = 'website',
  noIndex = false,
}) => {
  const location = useLocation()
  const baseUrl = 'https://appstore.example.com'
  const fullUrl = `${baseUrl}${location.pathname}`
  const fullTitle = title ? `${title} | AppStore` : 'AppStore - Enterprise App Store'
  const fullDescription = description || 'Discover and download apps for any platform. Browse thousands of web, desktop, mobile, and CLI applications.'
  const fullImage = image || `${baseUrl}/og-image.png`

  useEffect(() => {
    // Update document title
    document.title = fullTitle

    // Update or create meta tags
    const metaTags = {
      'description': fullDescription,
      'og:title': fullTitle,
      'og:description': fullDescription,
      'og:image': fullImage,
      'og:url': fullUrl,
      'og:type': type,
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': fullDescription,
      'twitter:image': fullImage,
    }

    if (noIndex) {
      metaTags['robots'] = 'noindex,nofollow'
    }

    Object.entries(metaTags).forEach(([name, content]) => {
      const isOg = name.startsWith('og:') || name.startsWith('twitter:')
      const attr = isOg ? 'property' : 'name'
      let tag = document.querySelector(`meta[${attr}="${name}"]`)

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attr, name)
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    })

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)

    return () => {
      // Cleanup is optional since we're updating in place
    }
  }, [fullTitle, fullDescription, fullImage, fullUrl, type, noIndex])

  return null
}

export default SEOHead