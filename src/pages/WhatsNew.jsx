// src/pages/WhatsNew.jsx
import React from 'react'
import { Sparkles, Check, Bug, Zap, Star, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button } from '../components/common'

const CHANGELOG = [
  {
    version: '1.3.0',
    date: '2024-02-22',
    tag: 'Latest',
    highlights: 'App Comparison, Developer Profiles, and more!',
    sections: [
      {
        type: 'feature',
        icon: Sparkles,
        color: 'text-main',
        label: 'New Features',
        items: [
          'App comparison tool — compare up to 3 apps side by side',
          'Developer profile pages with stats and portfolio',
          'Command palette (⌘K) for quick navigation',
          'Keyboard shortcuts for power users',
          'Collection management with drag & drop',
        ],
      },
      {
        type: 'improvement',
        icon: Zap,
        color: 'text-yellow-400',
        label: 'Improvements',
        items: [
          'Redesigned app detail page with tabs',
          'Faster search with instant results',
          'Better mobile navigation experience',
          'Improved filter modal with price range',
        ],
      },
      {
        type: 'fix',
        icon: Bug,
        color: 'text-red-400',
        label: 'Bug Fixes',
        items: [
          'Fixed download counter not updating',
          'Fixed sidebar not closing on mobile after navigation',
          'Fixed search history duplicates',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2024-02-10',
    tag: null,
    highlights: 'Collections, Upload flow, Admin panel',
    sections: [
      {
        type: 'feature',
        icon: Sparkles,
        color: 'text-main',
        label: 'New Features',
        items: [
          'Collections — organize your favorite apps',
          'Multi-step upload workflow',
          'Admin dashboard with analytics',
          'User management for admins',
          'File upload with drag & drop',
        ],
      },
      {
        type: 'improvement',
        icon: Zap,
        color: 'text-yellow-400',
        label: 'Improvements',
        items: [
          'Persistent state with Zustand',
          'Lazy loading for all pages',
          'Toast notification system',
          'Error boundary for graceful error handling',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2024-01-25',
    tag: null,
    highlights: 'Search, Filters, Auth pages',
    sections: [
      {
        type: 'feature',
        icon: Sparkles,
        color: 'text-main',
        label: 'New Features',
        items: [
          'Advanced search with filters',
          'Login and registration pages',
          'Favorites system',
          'Download management',
          'App screenshots lightbox',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2024-01-10',
    tag: null,
    highlights: 'Initial release',
    sections: [
      {
        type: 'feature',
        icon: Star,
        color: 'text-main',
        label: 'Initial Release',
        items: [
          'App catalog with 10+ sample apps',
          'Category browsing',
          'App detail pages',
          'Responsive design (mobile-first)',
          'Dark theme',
          'Sidebar navigation',
        ],
      },
    ],
  },
]

const WhatsNew = () => {
  const navigate = useNavigate()

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-main transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-main/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-main" />
        </div>
        <h1 className="text-4xl font-bold mb-2">What's New</h1>
        <p className="text-text-muted text-lg">See what we've been working on</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-bg-secondary" />

        <div className="space-y-12">
          {CHANGELOG.map((release, ri) => (
            <div key={release.version} className="relative">
              {/* Timeline Dot */}
              <div className={`
                absolute left-4 md:left-6 w-5 h-5 rounded-full border-4 
                ${ri === 0 ? 'bg-main border-main/30' : 'bg-bg-secondary border-bg'}
              `} />

              <div className="ml-16 md:ml-20">
                {/* Version Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">v{release.version}</h2>
                  {release.tag && (
                    <Badge variant="primary">{release.tag}</Badge>
                  )}
                  <span className="text-text-muted">{release.date}</span>
                </div>

                <p className="text-text-muted mb-6">{release.highlights}</p>

                {/* Sections */}
                <div className="space-y-6">
                  {release.sections.map((section, si) => {
                    const SectionIcon = section.icon
                    return (
                      <div key={si} className="card">
                        <h3 className={`flex items-center gap-2 font-semibold mb-4 ${section.color}`}>
                          <SectionIcon className="w-5 h-5" />
                          {section.label}
                        </h3>
                        <ul className="space-y-3">
                          {section.items.map((item, ii) => (
                            <li key={ii} className="flex items-start gap-3">
                              <Check className="w-4 h-4 text-main mt-1 flex-shrink-0" />
                              <span className="text-text-muted">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WhatsNew