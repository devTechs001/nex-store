import { useState } from 'react'
import { Bell, Download, RefreshCw, Shield, Moon, Globe, Wifi, Trash2, Check } from 'lucide-react'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

export const EnhancedSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoUpdate: true,
    autoUpdateWifiOnly: false,
    betaPrograms: false,
    darkMode: true,
    language: 'en',
    analytics: false,
    crashReports: true,
    clearCacheOnExit: false,
  })

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
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

  return (
    <div className="space-y-6">
      {/* App Updates Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-main" />
          App Updates
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Auto Update Apps</p>
              <p className="text-sm text-text-muted">Automatically download and install updates</p>
            </div>
            <Toggle value={settings.autoUpdate} onChange={(v) => setSettings({ ...settings, autoUpdate: v })} />
          </div>
          <div className={`flex items-center justify-between py-2 ${!settings.autoUpdate && 'opacity-50'}`}>
            <div>
              <p className="font-medium flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Wi-Fi Only
              </p>
              <p className="text-sm text-text-muted">Only update when connected to Wi-Fi</p>
            </div>
            <Toggle value={settings.autoUpdateWifiOnly} onChange={(v) => setSettings({ ...settings, autoUpdateWifiOnly: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Beta Updates</p>
              <p className="text-sm text-text-muted">Receive beta versions of apps</p>
            </div>
            <Toggle value={settings.betaPrograms} onChange={(v) => setSettings({ ...settings, betaPrograms: v })} />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-text-muted">Receive updates about new apps and features</p>
            </div>
            <Toggle value={settings.notifications} onChange={(v) => setSettings({ ...settings, notifications: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Update Notifications</p>
              <p className="text-sm text-text-muted">Get notified when updates are available</p>
            </div>
            <Toggle value={settings.autoUpdate} onChange={(v) => setSettings({ ...settings, autoUpdate: v })} />
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Privacy & Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Usage Analytics</p>
              <p className="text-sm text-text-muted">Help improve by sharing anonymous usage data</p>
            </div>
            <Toggle value={settings.analytics} onChange={(v) => setSettings({ ...settings, analytics: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Crash Reports</p>
              <p className="text-sm text-text-muted">Automatically send crash reports to developers</p>
            </div>
            <Toggle value={settings.crashReports} onChange={(v) => setSettings({ ...settings, crashReports: v })} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-400" />
          Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-text-muted">Use dark theme throughout the app</p>
            </div>
            <Toggle value={settings.darkMode} onChange={(v) => setSettings({ ...settings, darkMode: v })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text focus:border-main transition-colors"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Storage
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Clear Cache on Exit</p>
              <p className="text-sm text-text-muted">Automatically clear cache when closing the app</p>
            </div>
            <Toggle value={settings.clearCacheOnExit} onChange={(v) => setSettings({ ...settings, clearCacheOnExit: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Cache Size</span>
            <span className="font-medium">245 MB</span>
          </div>
          <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
            <div className="h-full bg-main rounded-full" style={{ width: '12%' }} />
          </div>
          <Button variant="outline" fullWidth icon={Trash2}>
            Clear Cache Now
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">About NexStore</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Build</span>
            <span>2024.03.21</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Engine</span>
            <span>React + Vite</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-bg">
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <Globe className="w-4 h-4" />
            <span>github.com/devTechs001/nex-store</span>
          </div>
        </div>
      </div>
    </div>
  )
}
