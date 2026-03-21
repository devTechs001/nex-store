// src/components/layout/Header.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, Upload, Search, Download } from 'lucide-react'
import { useUIStore, useAppStore, useAuthStore } from '../../store'
import { Avatar, Dropdown, Badge, Button } from '../common'
import NotificationBell from '../notifications/NotificationBell'

const Header = () => {
  const navigate = useNavigate()
  const { toggleSidebar, openModal } = useUIStore()
  const { downloads } = useAppStore()
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-xl border-b border-bg-secondary/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left - Logo & Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-3xl group-hover:scale-110 transition-transform">🏪</span>
            <span className="text-xl font-bold text-main hidden sm:block group-hover:glow-text transition-all">
              AppStore
            </span>
          </Link>
        </div>

        {/* Center - Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-bg-secondary/80 rounded-xl text-text-muted hover:bg-bg-secondary transition-colors border border-bg-secondary/50"
          >
            <Search className="w-5 h-5" />
            <span className="text-sm">Search apps, tools, libraries...</span>
            <kbd className="ml-auto px-2 py-0.5 bg-bg rounded text-xs text-text-muted">⌘K</kbd>
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => navigate('/upload')}
            className="hidden sm:flex"
          >
            Upload
          </Button>

          {/* Search (Mobile) */}
          <button
            onClick={() => navigate('/search')}
            className="md:hidden p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Downloads */}
          <Link
            to="/downloads"
            className="relative p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            {downloads.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-main text-bg text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                {downloads.length > 9 ? '9+' : downloads.length}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 p-1.5 hover:bg-bg-secondary rounded-xl transition-colors">
                  <Avatar src={user?.avatar} size="sm" />
                </button>
              }
            >
              {({ close }) => (
                <>
                  <div className="px-4 py-3 border-b border-bg">
                    <p className="font-medium text-text">{user?.name || 'User'}</p>
                    <p className="text-sm text-text-muted">{user?.email}</p>
                  </div>
                  <Dropdown.Item onClick={() => { navigate('/profile'); close() }}>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => { navigate('/settings'); close() }}>
                    Settings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => { logout(); close() }} danger>
                    Sign Out
                  </Dropdown.Item>
                </>
              )}
            </Dropdown>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header