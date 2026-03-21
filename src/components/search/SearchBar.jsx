// src/components/search/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { useAppStore } from '../../store'

const SearchBar = ({ 
  value = '', 
  onChange, 
  onSubmit,
  placeholder = 'Search apps, tools, libraries...',
  autoFocus = false,
  showHistory = false,
  showTrending = false,
}) => {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const { searchHistory, addToSearchHistory, clearSearchHistory } = useAppStore()

  const trendingSearches = ['React', 'Python', 'Docker', 'AI Tools', 'CLI']

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      addToSearchHistory(value.trim())
      onSubmit?.(value.trim())
      navigate(`/search?q=${encodeURIComponent(value.trim())}`)
    }
  }

  const handleSearchClick = (query) => {
    onChange?.(query)
    addToSearchHistory(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setIsFocused(false)
  }

  const showDropdown = isFocused && (showHistory || showTrending)

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="w-full bg-bg-secondary border-2 border-transparent rounded-xl pl-12 pr-10 py-3.5 text-text placeholder:text-text-muted focus:border-main transition-colors"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange?.('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary rounded-xl shadow-lg border border-bg overflow-hidden z-50">
          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <div className="p-4 border-b border-bg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-muted flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </span>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-main hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(query)}
                    className="px-3 py-1.5 bg-bg rounded-lg text-sm hover:bg-main hover:text-bg transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          {showTrending && (
            <div className="p-4">
              <span className="text-sm text-text-muted flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                Trending Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(query)}
                    className="px-3 py-1.5 bg-bg rounded-lg text-sm hover:bg-main hover:text-bg transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar