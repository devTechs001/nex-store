// src/pages/Admin/Dashboard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, Users, Download, Star, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Eye, AlertCircle,
  Clock, CheckCircle, XCircle
} from 'lucide-react'
import { useAppStore, useAuthStore } from '../../store'
import { Button, Badge, Progress } from '../../components/common'
import { formatNumber } from '../../utils/formatters'

const AdminDashboard = () => {
  const { apps, downloads } = useAppStore()
  const { isAdmin } = useAuthStore()

  // Mock data for demonstration
  const stats = [
    { 
      label: 'Total Apps', 
      value: apps.length, 
      change: +12, 
      icon: Package, 
      color: 'text-main',
      bgColor: 'bg-main/20',
    },
    { 
      label: 'Total Users', 
      value: 52480, 
      change: +8.2, 
      icon: Users, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
    },
    { 
      label: 'Downloads', 
      value: 1284930, 
      change: +23.5, 
      icon: Download, 
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
    },
    { 
      label: 'Avg. Rating', 
      value: 4.6, 
      change: +0.3, 
      icon: Star, 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
    },
  ]

  const recentActivity = [
    { type: 'upload', message: 'New app "CodeSync IDE" submitted', time: '5m ago', status: 'pending' },
    { type: 'user', message: 'New user registration: john@example.com', time: '12m ago', status: 'success' },
    { type: 'report', message: 'App "FakeApp" reported for malware', time: '1h ago', status: 'warning' },
    { type: 'review', message: 'Negative review flagged on "DataFlow Pro"', time: '2h ago', status: 'warning' },
    { type: 'upload', message: 'App "Terminal++" updated to v4.2.0', time: '3h ago', status: 'success' },
  ]

  const pendingApprovals = [
    { id: 1, name: 'NewApp Pro', developer: 'John Dev', submitted: '2 hours ago', category: 'Utility' },
    { id: 2, name: 'GameHelper', developer: 'GameDev Inc', submitted: '5 hours ago', category: 'Gaming' },
    { id: 3, name: 'DataSync', developer: 'DataCorp', submitted: '1 day ago', category: 'API' },
  ]

  const topApps = apps.slice(0, 5).map((app, i) => ({
    ...app,
    rank: i + 1,
    weeklyDownloads: Math.floor(Math.random() * 10000) + 1000,
  }))

  if (!isAdmin) {
    return (
      <div className="page-container text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-text-muted mb-6">You don't have permission to access this page.</p>
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-text-muted">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Data</Button>
          <Button variant="primary">Generate Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold">{typeof stat.value === 'number' && stat.value > 100 ? formatNumber(stat.value) : stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {activity.status === 'success' ? <CheckCircle className="w-5 h-5" /> :
                   activity.status === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-text-muted">{activity.time}</p>
                </div>
                <Badge variant={
                  activity.status === 'success' ? 'success' :
                  activity.status === 'warning' ? 'warning' : 'info'
                } size="xs">
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            <Badge variant="warning">{pendingApprovals.length}</Badge>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((app) => (
              <div key={app.id} className="p-3 rounded-xl bg-bg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-text-muted">{app.developer}</p>
                  </div>
                  <Badge size="xs">{app.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{app.submitted}</span>
                  <div className="flex gap-2">
                    <Button variant="success" size="xs" icon={CheckCircle}>
                      Approve
                    </Button>
                    <Button variant="danger" size="xs" icon={XCircle}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/apps" className="block mt-4">
            <Button variant="ghost" fullWidth>View All Submissions</Button>
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Downloads Chart Placeholder */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Downloads Overview</h2>
          <div className="h-64 flex items-center justify-center bg-bg rounded-xl">
            <div className="text-center text-text-muted">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Top Apps */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Top Apps This Week</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {topApps.map((app) => (
              <div key={app.id} className="flex items-center gap-4">
                <span className="text-lg font-bold text-text-muted w-6">
                  {app.rank}
                </span>
                <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-xl">
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{app.name}</p>
                  <p className="text-sm text-text-muted">{formatNumber(app.weeklyDownloads)} downloads</p>
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  {Math.floor(Math.random() * 30) + 5}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-6">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted">Server Load</span>
              <span className="font-medium">42%</span>
            </div>
            <Progress value={42} variant="success" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted">Storage Used</span>
              <span className="font-medium">68%</span>
            </div>
            <Progress value={68} variant="warning" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted">API Calls Today</span>
              <span className="font-medium">89%</span>
            </div>
            <Progress value={89} variant="danger" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard