// src/pages/DevDashboard.jsx
import React, { useState } from 'react'
import { 
  Package, Download, Star, Eye, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Users, DollarSign,
  BarChart3, PieChart, Activity, Calendar, Plus,
  Settings, Bell, Code, ExternalLink, AlertCircle
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { Button, Badge, Progress, Tabs, Avatar } from '../components/common'
import { formatNumber, formatDate } from '../utils/formatters'

const DevDashboard = () => {
  const navigate = useNavigate()
  const { apps } = useAppStore()
  const [timeRange, setTimeRange] = useState('30d')

  // Mock developer apps
  const myApps = apps.slice(0, 4).map(app => ({
    ...app,
    developer: 'You',
    weeklyDownloads: Math.floor(Math.random() * 5000) + 500,
    revenue: (Math.random() * 1000).toFixed(2),
    activeUsers: Math.floor(Math.random() * 10000) + 1000,
    crashRate: (Math.random() * 2).toFixed(2),
    satisfaction: (4 + Math.random()).toFixed(1),
  }))

  const totalStats = {
    downloads: myApps.reduce((sum, app) => sum + app.downloads, 0),
    revenue: myApps.reduce((sum, app) => sum + parseFloat(app.revenue), 0),
    activeUsers: myApps.reduce((sum, app) => sum + app.activeUsers, 0),
    avgRating: myApps.reduce((sum, app) => sum + app.rating, 0) / myApps.length,
  }

  const dashboardStats = [
    {
      label: 'Total Downloads',
      value: formatNumber(totalStats.downloads),
      change: +18.5,
      icon: Download,
      color: 'text-main',
      bgColor: 'bg-main/20',
    },
    {
      label: 'Revenue',
      value: `$${totalStats.revenue.toFixed(0)}`,
      change: +12.3,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
    },
    {
      label: 'Active Users',
      value: formatNumber(totalStats.activeUsers),
      change: +8.7,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
    },
    {
      label: 'Avg Rating',
      value: totalStats.avgRating.toFixed(1),
      change: +0.2,
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
    },
  ]

  const alerts = [
    { type: 'warning', message: 'DataFlow Pro has 3 new crash reports', time: '2h ago' },
    { type: 'success', message: 'CodeSync IDE review approved', time: '5h ago' },
    { type: 'info', message: 'New version guidelines published', time: '1d ago' },
  ]

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-main" />
                Downloads Over Time
              </h3>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const height = 30 + Math.random() * 70
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-main/20 hover:bg-main/40 rounded-t transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Revenue Breakdown
              </h3>
              <div className="space-y-4">
                {myApps.map(app => (
                  <div key={app.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center gap-2">
                        <span>{app.icon}</span> {app.name}
                      </span>
                      <span className="text-sm font-medium">${app.revenue}</span>
                    </div>
                    <Progress 
                      value={(parseFloat(app.revenue) / totalStats.revenue) * 100} 
                      size="sm" 
                      variant="gradient"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Reviews</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {[
                { user: 'Alex M.', app: 'CodeSync IDE', rating: 5, text: 'Best IDE extension ever!', time: '2h ago' },
                { user: 'Sarah K.', app: 'DataFlow Pro', rating: 4, text: 'Great tool, needs better docs.', time: '5h ago' },
                { user: 'Mike R.', app: 'Terminal++', rating: 5, text: 'Simply amazing.', time: '1d ago' },
              ].map((review, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-bg rounded-xl">
                  <Avatar size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.user}</span>
                      <span className="text-text-muted text-xs">on {review.app}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array(5).fill(0).map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-text-muted">{review.text}</p>
                  </div>
                  <span className="text-xs text-text-muted">{review.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'apps',
      label: `My Apps (${myApps.length})`,
      content: (
        <div className="space-y-4">
          {myApps.map(app => (
            <div key={app.id} className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-bg rounded-xl flex items-center justify-center text-2xl">
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{app.name}</h3>
                  <Badge variant="success" size="xs">v{app.version}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {formatNumber(app.downloads)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    {app.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {formatNumber(app.activeUsers)} active
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-green-400" />
                    ${app.revenue}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={BarChart3} onClick={() => navigate(`/app/${app.id}`)}>
                  Analytics
                </Button>
                <Button variant="ghost" size="sm" icon={Settings} />
              </div>
            </div>
          ))}

          <Button variant="outline" fullWidth icon={Plus} onClick={() => navigate('/upload')}>
            Upload New App
          </Button>
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
          <p className="text-text-muted mb-6">Deep dive into your app performance metrics</p>
          <Button variant="primary">Coming Soon</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Code className="w-8 h-8 text-main" />
            Developer Dashboard
          </h1>
          <p className="text-text-muted">Manage your apps and track performance</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range ? 'bg-main text-bg' : 'bg-bg-secondary hover:bg-main/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
              alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
              alert.type === 'success' ? 'bg-green-500/10 text-green-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{alert.message}</span>
              <span className="text-text-muted text-xs">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-sm ${
                stat.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <p className="text-2xl font-bold mb-0.5">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" variant="underline" />
    </div>
  )
}

export default DevDashboard