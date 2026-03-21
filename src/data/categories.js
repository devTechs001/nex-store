// src/data/categories.js
import { Grid, Globe, Monitor, Smartphone, Terminal, Database, BookOpen, Zap } from 'lucide-react'

export const CATEGORIES = [
  { id: 'all', name: 'All Apps', icon: Grid, color: '#0ef', slug: 'all' },
  { id: 'web', name: 'Web Apps', icon: Globe, color: '#3b82f6', slug: 'web-apps' },
  { id: 'desktop', name: 'Desktop', icon: Monitor, color: '#8b5cf6', slug: 'desktop' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: '#10b981', slug: 'mobile' },
  { id: 'cli', name: 'CLI Tools', icon: Terminal, color: '#f59e0b', slug: 'cli-tools' },
  { id: 'api', name: 'APIs', icon: Database, color: '#ef4444', slug: 'apis' },
  { id: 'library', name: 'Libraries', icon: BookOpen, color: '#ec4899', slug: 'libraries' },
  { id: 'utility', name: 'Utilities', icon: Zap, color: '#06b6d4', slug: 'utilities' },
]

export const getCategoryBySlug = (slug) => CATEGORIES.find(c => c.slug === slug)
export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id)