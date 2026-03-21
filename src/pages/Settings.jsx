// src/pages/Settings.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Moon, Sun, Globe, Shield, Trash2, LogOut,
  User, Lock, Database, HelpCircle, ExternalLink, Palette
} from 'lucide-react'
import { useAuthStore } from '../store'
import { useToast } from '../context/ToastContext'
import { Button, Avatar, Badge, Progress, ThemeSwitcher } from '../components/common'

const Settings = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, logout } = useAuthStore()

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    autoUpdate: true,
    analytics: false,
    darkMode: true,
    language: 'en',
  })

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success('Setting updated')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        value ? 'bg-main' : 'bg-bg'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          value ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  )

  const SettingItem = ({ icon: Icon, title, description, action }) => (
    <div className="flex items-center justify-between py-4 border-b border-bg last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
          <Icon className="w-5 h-5 text-main" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="title">Settings</h1>

      {/* Profile Section */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="flex items-center gap-4 mb-4">
          <Avatar src={user?.avatar} size="xl" />
          <div className="flex-1">
            <p className="font-semibold">{user?.name || 'John Developer'}</p>
            <p className="text-sm text-text-muted">{user?.email || 'john@developer.com'}</p>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
        <SettingItem
          icon={Lock}
          title="Change Password"
          description="Update your password"
          action={<Button variant="ghost" size="sm">Change</Button>}
        />
        <SettingItem
          icon={Shield}
          title="Two-Factor Authentication"
          description="Add extra security to your account"
          action={<Badge variant="warning">Not enabled</Badge>}
        />
      </div>

      {/* Preferences */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <SettingItem
          icon={Palette}
          title="Theme"
          description="Choose your preferred theme"
          action={null}
        />
        <div className="mt-4">
          <ThemeSwitcher variant="grid" />
        </div>
        <SettingItem
          icon={Bell}
          title="Push Notifications"
          description="Receive updates about new apps"
          action={
            <Toggle 
              value={settings.notifications} 
              onChange={() => toggleSetting('notifications')} 
            />
          }
        />
        <SettingItem
          icon={Bell}
          title="Email Updates"
          description="Receive weekly digest emails"
          action={
            <Toggle 
              value={settings.emailUpdates} 
              onChange={() => toggleSetting('emailUpdates')} 
            />
          }
        />
        <SettingItem
          icon={Database}
          title="Auto Update"
          description="Automatically update installed apps"
          action={
            <Toggle 
              value={settings.autoUpdate} 
              onChange={() => toggleSetting('autoUpdate')} 
            />
          }
        />
        <SettingItem
          icon={Moon}
          title="Dark Mode"
          description="Use dark theme"
          action={
            <Toggle 
              value={settings.darkMode} 
              onChange={() => toggleSetting('darkMode')} 
            />
          }
        />
        <SettingItem
          icon={Globe}
          title="Language"
          description="Choose your language"
          action={
            <select 
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="bg-bg rounded-lg px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          }
        />
      </div>

      {/* Storage */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Storage</h2>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-text-muted">Used Space</span>
            <span className="font-medium">2.4 GB / 10 GB</span>
          </div>
          <Progress value={24} showLabel={false} variant="gradient" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Trash2} onClick={() => toast.success('Cache cleared!')}>
            Clear Cache
          </Button>
          <Button variant="outline">
            Manage Storage
          </Button>
        </div>
      </div>

      {/* Privacy */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Privacy</h2>
        <SettingItem
          icon={Database}
          title="Analytics"
          description="Help improve by sharing usage data"
          action={
            <Toggle 
              value={settings.analytics} 
              onChange={() => toggleSetting('analytics')} 
            />
          }
        />
        <SettingItem
          icon={Shield}
          title="Privacy Policy"
          action={
            <Button variant="ghost" size="sm" icon={ExternalLink}>
              View
            </Button>
          }
        />
        <SettingItem
          icon={HelpCircle}
          title="Terms of Service"
          action={
            <Button variant="ghost" size="sm" icon={ExternalLink}>
              View
            </Button>
          }
        />
      </div>

      {/* About */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Build</span>
            <span>2024.02.22</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Platform</span>
            <span>Web</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-red-500/20">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <Button variant="danger" fullWidth icon={LogOut} onClick={handleLogout}>
            Sign Out
          </Button>
          <Button 
            variant="ghost" 
            fullWidth 
            className="text-red-400 hover:bg-red-500/10"
            onClick={() => toast.warning('This action cannot be undone!')}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings