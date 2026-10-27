export const THEMES = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Pro',
    isLight: false,
    swatch: ['#6366f1', '#06b6d4', '#070b14'],
    vars: {
      '--bg-app': '#060913',
      '--bg-header': 'rgba(9, 13, 24, 0.88)',
      '--bg-card': '#0f1629',
      '--bg-card-hover': '#141d36',
      '--bg-subtle': '#090e1a',
      '--bg-input': '#090e1a',
      '--text-main': '#f8fafc',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--border-color': 'rgba(148, 163, 184, 0.14)',
      '--border-hover': 'rgba(99, 102, 241, 0.5)',
      '--accent': '#6366f1',
      '--accent-hover': '#4f46e5',
      '--accent-secondary': '#06b6d4',
      '--accent-contrast': '#ffffff',
      '--hero-bg-start': '#080d1a',
      '--hero-bg-mid': '#0f172e',
      '--hero-bg-end': '#171d42',
      '--shadow-card': '0 16px 36px -16px rgba(2, 6, 23, 0.75)'
    }
  },
  light: {
    id: 'light',
    name: 'Alabaster Light',
    isLight: true,
    swatch: ['#4f46e5', '#0891b2', '#ffffff'],
    vars: {
      '--bg-app': '#f1f5f9',
      '--bg-header': 'rgba(255, 255, 255, 0.92)',
      '--bg-card': '#ffffff',
      '--bg-card-hover': '#f8fafc',
      '--bg-subtle': '#f1f5f9',
      '--bg-input': '#ffffff',
      '--text-main': '#0f172a',
      '--text-secondary': '#334155',
      '--text-muted': '#64748b',
      '--border-color': '#cbd5e1',
      '--border-hover': '#6366f1',
      '--accent': '#4f46e5',
      '--accent-hover': '#4338ca',
      '--accent-secondary': '#0891b2',
      '--accent-contrast': '#ffffff',
      '--hero-bg-start': '#ffffff',
      '--hero-bg-mid': '#f5f7ff',
      '--hero-bg-end': '#eef2ff',
      '--shadow-card': '0 10px 25px -10px rgba(15, 23, 42, 0.08)'
    }
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    isLight: false,
    swatch: ['#00eeff', '#a855f7', '#161b26'],
    vars: {
      '--bg-app': '#121620',
      '--bg-header': 'rgba(18, 22, 32, 0.9)',
      '--bg-card': '#1b2232',
      '--bg-card-hover': '#222b3f',
      '--bg-subtle': '#141925',
      '--bg-input': '#141925',
      '--text-main': '#ffffff',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--border-color': 'rgba(0, 238, 255, 0.18)',
      '--border-hover': 'rgba(0, 238, 255, 0.6)',
      '--accent': '#06b6d4',
      '--accent-hover': '#0891b2',
      '--accent-secondary': '#a855f7',
      '--accent-contrast': '#ffffff',
      '--hero-bg-start': '#111827',
      '--hero-bg-mid': '#162436',
      '--hero-bg-end': '#1e1b38',
      '--shadow-card': '0 16px 36px -16px rgba(0, 238, 255, 0.14)'
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Aurora',
    isLight: false,
    swatch: ['#818cf8', '#f472b6', '#0c1021'],
    vars: {
      '--bg-app': '#090c18',
      '--bg-header': 'rgba(9, 12, 24, 0.9)',
      '--bg-card': '#13192e',
      '--bg-card-hover': '#19213c',
      '--bg-subtle': '#0c1020',
      '--bg-input': '#0c1020',
      '--text-main': '#f8fafc',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--border-color': 'rgba(129, 140, 248, 0.18)',
      '--border-hover': 'rgba(244, 114, 182, 0.55)',
      '--accent': '#6366f1',
      '--accent-hover': '#4f46e5',
      '--accent-secondary': '#ec4899',
      '--accent-contrast': '#ffffff',
      '--hero-bg-start': '#0b0f21',
      '--hero-bg-mid': '#171636',
      '--hero-bg-end': '#281538',
      '--shadow-card': '0 16px 36px -16px rgba(99, 102, 241, 0.2)'
    }
  },
  forest: {
    id: 'forest',
    name: 'Emerald Matrix',
    isLight: false,
    swatch: ['#10b981', '#34d399', '#071410'],
    vars: {
      '--bg-app': '#06110e',
      '--bg-header': 'rgba(6, 17, 14, 0.9)',
      '--bg-card': '#0d1f1a',
      '--bg-card-hover': '#132a23',
      '--bg-subtle': '#081612',
      '--bg-input': '#081612',
      '--text-main': '#ecfdf5',
      '--text-secondary': '#a7f3d0',
      '--text-muted': '#6ee7b7',
      '--border-color': 'rgba(16, 185, 129, 0.2)',
      '--border-hover': 'rgba(52, 211, 153, 0.55)',
      '--accent': '#10b981',
      '--accent-hover': '#059669',
      '--accent-secondary': '#06b6d4',
      '--accent-contrast': '#ffffff',
      '--hero-bg-start': '#061410',
      '--hero-bg-mid': '#0b241d',
      '--hero-bg-end': '#0f2e26',
      '--shadow-card': '0 16px 36px -16px rgba(16, 185, 129, 0.18)'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    isLight: false,
    swatch: ['#38bdf8', '#2dd4bf', '#07131f'],
    vars: {
      '--bg-app': '#06101a',
      '--bg-header': 'rgba(6, 16, 26, 0.9)',
      '--bg-card': '#0d1e30',
      '--bg-card-hover': '#132840',
      '--bg-subtle': '#081523',
      '--bg-input': '#081523',
      '--text-main': '#f0f9ff',
      '--text-secondary': '#bae6fd',
      '--text-muted': '#7dd3fc',
      '--border-color': 'rgba(56, 189, 248, 0.2)',
      '--border-hover': 'rgba(45, 212, 191, 0.55)',
      '--accent': '#0284c7',
      '--accent-hover': '#0369a1',
      '--accent-secondary': '#14b8a6',
      '--accent-contrast': '#ffffff',
      '--hero-bg-start': '#071320',
      '--hero-bg-mid': '#0c2136',
      '--hero-bg-end': '#0f2d3d',
      '--shadow-card': '0 16px 36px -16px rgba(56, 189, 248, 0.18)'
    }
  }
};

export function applyThemeVariables(themeId = 'obsidian') {
  const theme = THEMES[themeId] || THEMES.obsidian;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(theme.vars)) {
    root.style.setProperty(key, val);
  }
  root.setAttribute('data-theme', theme.id);
  if (theme.isLight) {
    root.classList.remove('dark');
    root.classList.add('light-theme');
  } else {
    root.classList.add('dark');
    root.classList.remove('light-theme');
  }
  return theme;
}
