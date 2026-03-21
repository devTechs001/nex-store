// src/pages/Admin/Analytics.jsx
import React, { useState } from 'react'
import { 
  TrendingUp, TrendingDown, Download, Users, Package, 
  Star, Calendar, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react'
import { useAppStore } from '../../store'
import { Button, Badge, Progress } from '../../components/common'
import { formatNumber } from '../../utils/formatters'

const Analytics = () => {
  const { apps } = useAppStore()
  const [timeRange, setTimeRange] = useState('7d')

  const stats = [
    { 
      label: 'Total Views', 
      value: 2458930, 
      change: +15.3, 
      icon: Eye,
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
    },
    { 
      label: 'Downloads', 
      value: 128430, 
      change: +23.5, 
      icon: Download,
      data: [65, 59, 80, 81, 56, 55, 40, 70, 85]
    },
    { 
      label: 'New Users', 
      value: 5240, 
      change: -2.4, 
      icon: Users,
      data: [28, 48, 40, 19, 86, 27, 90, 65, 55]
    },
    { 
      label: 'App Submissions', 
      value: 342, 
      change: +8.7, 
      icon: Package,
      data: [12, 19, 3, 5, 2, 3, 15, 20, 18]
    },
  ]

  const topCategories = [
    { name: 'Web Apps', downloads: 45230, percentage: 35 },
    { name: 'CLI Tools', downloads: 32100, percentage: 25 },
    { name: 'Desktop', downloads: 25600, percentage: 20 },
    { name: 'Libraries', downloads: 15200, percentage: 12 },
    { name: 'Mobile', downloads: 10300, percentage: 8 },
  ]

  const topLanguages = [
    { name: 'JavaScript', count: 320, color: '#f7df1e' },
    { name: 'Python', count: 280, color: '#3776ab' },
    { name: 'TypeScript', count: 245, color: '#3178c6' },
    { name: 'Go', count: 180, color: '#00add8' },
    { name: 'Rust', count: 120, color: '#dea584' },
  ]

  const recentTrends = [
    { name: 'AI/ML Tools', trend: 'up', percentage: 156 },
    { name: 'CLI Applications', trend: 'up', percentage: 89 },
    { name: 'Docker Tools', trend: 'up', percentage: 67 },
    { name: 'Desktop Apps', trend: 'down', percentage: 12 },
    { name: 'Mobile Apps', trend: 'down', percentage: 8 },
  ]

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-text-muted">Track performance and trends</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-main text-bg'
                  : 'bg-bg-secondary hover:bg-main/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-main/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-main" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{formatNumber(stat.value)}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
            
            {/* Mini Chart */}
            <div className="flex items-end gap-1 h-12 mt-4">
              {stat.data.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-main/20 rounded-t"
                  style={{ height: `${(value / Math.max(...stat.data)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Downloads by Category */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Downloads by Category</h2>
          <div className="space-y-4">
            {topCategories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-text-muted">{formatNumber(category.downloads)}</span>
                </div>
                <Progress value={category.percentage} size="md" variant="gradient" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Languages */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Popular Languages</h2>
          <div className="space-y-4">
            {topLanguages.map((lang, i) => (
              <div key={lang.name} className="flex items-center gap-4">
                <span className="text-lg font-bold text-text-muted w-6">{i + 1}</span>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <div className="flex-1">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-sm text-text-muted">{lang.count} apps</p>
                </div>
                <Progress 
                  value={(lang.count / topLanguages[0].count) * 100} 
                  size="sm"
                  className="w-32"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Categories */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Trending This Week</h2>
          <div className="space-y-4">
            {recentTrends.map((trend) => (
              <div key={trend.name} className="flex items-center justify-between p-3 rounded-xl bg-bg">
                <div className="flex items-center gap-3">
                  {trend.trend === 'up' ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    </div>
                  )}
                  <span className="font-medium">{trend.name}</span>
                </div>
                <Badge variant={trend.trend === 'up' ? 'success' : 'danger'} size="sm">
                  {trend.trend === 'up' ? '+' : '-'}{trend.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-text-muted">Avg. Rating</span>
              </div>
              <p className="text-2xl font-bold">4.6</p>
            </div>
            <div className="bg-bg rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-main" />
                <span className="text-text-muted">Total Apps</span>
              </div>
              <p className="text-2xl font-bold">{apps.length}</p>
            </div>
            <div className="bg-bg rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-text-muted">Active Users</span>
              </div>
              <p className="text-2xl font-bold">48.2K</p>
            </div>
            <div className="bg-bg rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-text-muted">Daily Avg</span>
              </div>
              <p className="text-2xl font-bold">18.3K</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics