// src/components/notifications/NotificationBell.jsx
import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Dropdown } from '../common'
import NotificationList from './NotificationList'

const NotificationBell = () => {
  const [notifications] = useState([
    { id: 1, type: 'update', title: 'CodeSync IDE updated', message: 'Version 5.0.1 is now available', time: '5m ago', read: false },
    { id: 2, type: 'download', title: 'Download complete', message: 'Terminal++ has been installed', time: '1h ago', read: false },
    { id: 3, type: 'info', title: 'New features available', message: 'Check out our latest apps', time: '2h ago', read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Dropdown
      align="right"
      trigger={
        <button className="relative p-2 hover:bg-bg-secondary rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-main rounded-full animate-pulse" />
          )}
        </button>
      }
    >
      <NotificationList notifications={notifications} />
    </Dropdown>
  )
}

export default NotificationBell