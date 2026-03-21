// src/components/layout/Sidebar.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  X, Home, Search, Download, Heart, User, Settings,
  Upload, FolderOpen, Shield, BarChart3, Zap, Sparkles
} from 'lucide-react'
import { useUIStore, useAuthStore } from '../../store'
import { Button } from '../common'

const Sidebar = () => {
  const navigate = useNavigate()
  const { sidebarOpen, closeSidebar } = useUIStore()
  const { isAdmin } = useAuthStore()

  const mainNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/downloads', icon: Download, label: 'Downloads' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/collections', icon: FolderOpen, label: 'Collections' },
  ]

  const userNavItems = [
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/upload', icon: Upload, label: 'Upload App' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const adminNavItems = [
    { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      onClick={closeSidebar}
      className={({ isActive }) =>
        `group w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-main/20 to-main/10 text-main shadow-[0_0_15px_var(--main-color)] border border-main/30'
            : 'text-text hover:bg-bg-secondary hover:text-main border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`
            p-2 rounded-lg transition-all duration-300
            ${isActive ? 'bg-main text-bg shadow-lg' : 'bg-bg-secondary group-hover:bg-main/20'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-medium">{label}</span>
          {isActive && (
            <Sparkles className="w-4 h-4 ml-auto text-main animate-pulse" />
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-bg-secondary
        transform transition-transform duration-300 flex flex-col
        lg:static lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bg">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            <span className="text-2xl font-bold text-main">AppStore</span>
          </div>
          <button 
            onClick={closeSidebar} 
            className="lg:hidden p-2 hover:bg-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Nav */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Main Menu
            </p>
            {mainNavItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {/* User Nav */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Account
            </p>
            {userNavItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {/* Admin Nav */}
          {isAdmin && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                Admin
              </p>
              {adminNavItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          )}
        </nav>

        {/* Footer - Pro Banner */}
        <div className="p-4 border-t border-bg-secondary">
          <div className="relative overflow-hidden bg-gradient-to-br from-main/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-main/30">
            {/* Glow effect */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-main/30 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-main rounded-lg">
                  <Zap className="w-4 h-4 text-bg" />
                </div>
                <span className="font-bold text-main">Pro Version</span>
              </div>
              <p className="text-xs text-text-muted mb-3">Unlock all premium features</p>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => navigate('/upgrade')}
                className="bg-main text-bg hover:shadow-[0_0_15px_var(--main-color)]"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar