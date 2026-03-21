// src/pages/Profile.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Download, Heart, Star, Upload, Edit, 
  Settings, Shield, Award, Calendar 
} from 'lucide-react'
import { useAppStore, useAuthStore } from '../store'
import { Button, Avatar, Badge, Tabs } from '../components/common'
import { AppGrid } from '../components/apps'
import { formatDate } from '../utils/formatters'

const Profile = () => {
  const navigate = useNavigate()
  const { downloads, favorites } = useAppStore()
  const { user, isAuthenticated } = useAuthStore()

  const stats = [
    { label: 'Downloads', value: downloads.length, icon: Download, color: 'text-main' },
    { label: 'Favorites', value: favorites.length, icon: Heart, color: 'text-red-400' },
    { label: 'Reviews', value: 12, icon: Star, color: 'text-yellow-400' },
    { label: 'Uploads', value: 3, icon: Upload, color: 'text-green-400' },
  ]

  const recentActivity = [
    { action: 'Downloaded', app: 'CodeSync IDE', time: '2 hours ago', icon: Download },
    { action: 'Reviewed', app: 'Terminal++', time: '1 day ago', icon: Star },
    { action: 'Favorited', app: 'DataFlow Pro', time: '3 days ago', icon: Heart },
    { action: 'Updated', app: 'DockerFlow', time: '1 week ago', icon: Download },
  ]

  const achievements = [
    { name: 'Early Adopter', icon: '🚀', description: 'Joined in the first month' },
    { name: 'Power User', icon: '⚡', description: 'Downloaded 10+ apps' },
    { name: 'Reviewer', icon: '📝', description: 'Left 5+ reviews' },
    { name: 'Contributor', icon: '💎', description: 'Uploaded an app' },
  ]

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-8">
          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 card">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.action === 'Downloaded' ? 'bg-main/20 text-main' :
                    activity.action === 'Reviewed' ? 'bg-yellow-500/20 text-yellow-400' :
                    activity.action === 'Favorited' ? 'bg-red-500/20 text-red-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action} <span className="text-main">{activity.app}</span></p>
                    <p className="text-sm text-text-muted">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, i) => (
                <div key={i} className="card text-center">
                  <span className="text-4xl mb-2 block">{achievement.icon}</span>
                  <p className="font-semibold">{achievement.name}</p>
                  <p className="text-xs text-text-muted">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'downloads',
      label: 'Downloads',
      content: (
        <AppGrid 
          apps={downloads.slice(0, 8)} 
          emptyTitle="No downloads yet"
          emptyDescription="Apps you download will appear here"
        />
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      content: (
        <AppGrid 
          apps={favorites.slice(0, 8)} 
          emptyTitle="No favorites yet"
          emptyDescription="Save apps by tapping the heart icon"
        />
      ),
    },
    {
      id: 'uploads',
      label: 'My Uploads',
      content: (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-semibold mb-2">Share your creations</h3>
          <p className="text-text-muted mb-6">Upload your apps and reach developers worldwide</p>
          <Button variant="primary" icon={Upload} onClick={() => navigate('/upload')}>
            Upload App
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      <h1 className="title">Profile</h1>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar 
            src={user?.avatar} 
            size="2xl" 
            fallback={<span className="text-4xl">👤</span>}
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-bold">{user?.name || 'John Developer'}</h2>
              <Badge variant="primary" size="xs">Pro</Badge>
            </div>
            <p className="text-text-muted mb-1">{user?.email || 'john@developer.com'}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-text-muted">
              <Calendar className="w-4 h-4" />
              <span>Member since January 2024</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={Edit} onClick={() => navigate('/settings')}>
              Edit Profile
            </Button>
            <Button variant="ghost" icon={Settings} onClick={() => navigate('/settings')} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card text-center">
            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" variant="underline" />
    </div>
  )
}

export default Profile