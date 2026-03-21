// src/components/apps/AppStats.jsx
import React from 'react'
import { Download, Star, Eye, TrendingUp, Calendar, Clock } from 'lucide-react'
import { Badge, Progress } from '../common'
import { formatNumber, formatDate } from '../../utils/formatters'

const AppStats = ({ app }) => {
  // Mock rating distribution
  const ratingDistribution = [
    { stars: 5, count: 180, percentage: 65 },
    { stars: 4, count: 80, percentage: 29 },
    { stars: 3, count: 12, percentage: 4 },
    { stars: 2, count: 3, percentage: 1 },
    { stars: 1, count: 2, percentage: 1 },
  ]

  // Mock download history
  const downloadHistory = [
    { label: 'Today', value: 1234 },
    { label: 'This Week', value: 8452 },
    { label: 'This Month', value: 34521 },
    { label: 'All Time', value: app.downloads },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Download}
          label="Downloads"
          value={formatNumber(app.downloads)}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          icon={Star}
          label="Rating"
          value={app.rating.toFixed(1)}
          trend="+0.2"
          trendUp={true}
        />
        <StatCard
          icon={Eye}
          label="Views"
          value={formatNumber(app.downloads * 3)}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          icon={Calendar}
          label="Age"
          value={getAppAge(app.releaseDate)}
          trend=""
          trendUp={true}
        />
      </div>

      {/* Rating Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
        <div className="flex items-start gap-8">
          {/* Big Rating */}
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-bold text-main">{app.rating.toFixed(1)}</p>
            <div className="flex gap-1 justify-center mt-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= app.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                />
              ))}
            </div>
            <p className="text-sm text-text-muted mt-1">{app.reviews || 0} reviews</p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-text-muted w-12">{stars} star</span>
                <div className="flex-1">
                  <Progress value={percentage} size="sm" variant="default" />
                </div>
                <span className="text-sm text-text-muted w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Download History</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {downloadHistory.map(({ label, value }) => (
            <div key={label} className="bg-bg rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-main">{formatNumber(value)}</p>
              <p className="text-sm text-text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="mt-6 h-48 flex items-end gap-1 px-4">
          {Array.from({ length: 30 }, (_, i) => {
            const height = Math.random() * 80 + 20
            return (
              <div
                key={i}
                className="flex-1 bg-main/20 hover:bg-main/40 rounded-t transition-colors cursor-pointer group relative"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-secondary px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {Math.floor(height * 10)} downloads
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between px-4 mt-2 text-xs text-text-muted">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, trend, trendUp }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-5 h-5 text-main" />
      {trend && (
        <Badge variant={trendUp ? 'success' : 'danger'} size="xs">
          {trend}
        </Badge>
      )}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-text-muted">{label}</p>
  </div>
)

function getAppAge(releaseDate) {
  const now = new Date()
  const release = new Date(releaseDate)
  const diffMs = now - release
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 30) return `${diffDays}d`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
  return `${(diffDays / 365).toFixed(1)}yr`
}

export default AppStats