// src/components/notifications/NotificationList.jsx
import React from 'react'
import { Bell, Download, RefreshCw, Info } from 'lucide-react'
import NotificationItem from './NotificationItem'

const NotificationList = ({ notifications }) => {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bell className="w-8 h-8 mx-auto text-text-muted mb-2" />
        <p className="text-sm text-text-muted">No notifications</p>
      </div>
    )
  }

  return (
    <div className="w-80">
      <div className="px-4 py-3 border-b border-bg flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <button className="text-xs text-main hover:underline">Mark all as read</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
      <div className="px-4 py-3 border-t border-bg">
        <button className="w-full text-sm text-main hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationList