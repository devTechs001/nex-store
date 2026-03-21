// src/components/common/ThemeSwitcher.jsx
import React from 'react'
import { Moon, Sun, Palette, Check } from 'lucide-react'
import { useThemeStore } from '../../store/useThemeStore'
import Dropdown from './Dropdown'

const ThemeSwitcher = ({ variant = 'dropdown' }) => {
  const { currentTheme, setTheme, getThemes } = useThemeStore()
  const themes = getThemes()

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all text-left
              ${currentTheme === theme.id
                ? 'border-main shadow-[0_0_15px_var(--main-color)]'
                : 'border-transparent hover:border-main/30'
              }
            `}
            style={{ backgroundColor: theme.colors['--sbg-color'] }}
          >
            {/* Color Preview */}
            <div className="flex gap-1.5 mb-3">
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: theme.colors['--main-color'] }}
              />
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: theme.colors['--bg-color'] }}
              />
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: theme.colors['--text-color'] }}
              />
            </div>
            <p
              className="font-medium text-sm"
              style={{ color: theme.colors['--text-color'] }}
            >
              {theme.name}
            </p>

            {currentTheme === theme.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-main flex items-center justify-center">
                <Check className="w-4 h-4 text-bg" />
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dropdown
      align="right"
      trigger={
        <button className="p-2 hover:bg-bg-secondary rounded-lg transition-colors">
          <Palette className="w-5 h-5" />
        </button>
      }
    >
      <div className="p-2 w-48">
        <p className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
          Theme
        </p>
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
              ${currentTheme === theme.id ? 'bg-main/20 text-main' : 'hover:bg-bg'}
            `}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white/20"
              style={{ backgroundColor: theme.colors['--main-color'] }}
            />
            <span className="text-sm font-medium">{theme.name}</span>
            {currentTheme === theme.id && <Check className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </div>
    </Dropdown>
  )
}

export default ThemeSwitcher