// src/data/languages.js
export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '⚡', color: '#f7df1e' },
  { id: 'typescript', name: 'TypeScript', icon: '📘', color: '#3178c6' },
  { id: 'python', name: 'Python', icon: '🐍', color: '#3776ab' },
  { id: 'java', name: 'Java', icon: '☕', color: '#007396' },
  { id: 'cpp', name: 'C++', icon: '⚙️', color: '#00599c' },
  { id: 'csharp', name: 'C#', icon: '🎯', color: '#239120' },
  { id: 'rust', name: 'Rust', icon: '🦀', color: '#dea584' },
  { id: 'go', name: 'Go', icon: '🐹', color: '#00add8' },
  { id: 'swift', name: 'Swift', icon: '🍎', color: '#fa7343' },
  { id: 'kotlin', name: 'Kotlin', icon: '🎨', color: '#7f52ff' },
  { id: 'ruby', name: 'Ruby', icon: '💎', color: '#cc342d' },
  { id: 'php', name: 'PHP', icon: '🐘', color: '#777bb4' },
]

export const getLanguageById = (id) => LANGUAGES.find(l => l.id === id)