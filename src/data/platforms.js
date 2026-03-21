// src/data/platforms.js
export const PLATFORMS = [
  { id: 'windows', name: 'Windows', icon: '🪟' },
  { id: 'macos', name: 'macOS', icon: '🍎' },
  { id: 'linux', name: 'Linux', icon: '🐧' },
  { id: 'android', name: 'Android', icon: '🤖' },
  { id: 'ios', name: 'iOS', icon: '📱' },
  { id: 'web', name: 'Web', icon: '🌐' },
  { id: 'cross', name: 'Cross-Platform', icon: '🔄' },
]

export const getPlatformById = (id) => PLATFORMS.find(p => p.id === id)