// src/components/notifications/NotificationItem.jsx
import React from 'react'
import { Download, RefreshCw, Info } from 'lucide-react'

const NotificationItem = ({ notification }) => {
  const icons = {
    update: RefreshCw,
    download: Download,
    info: Info,
  }

  const Icon = icons[notification.type] || Info

  return (
    <div className={`
      flex items-start gap-3 px-4 py-3 hover:bg-bg cursor-pointer transition-colors
      ${!notification.read ? 'bg-main/5' : ''}
    `}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${!notification.read ? 'bg-main/20 text-main' : 'bg-bg-secondary text-text-muted'}
      `}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${!notification.read ? 'text-text' : 'text-text-muted'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-text-muted truncate">{notification.message}</p>
        <p className="text-xs text-text-muted mt-1">{notification.time}</p>
      </div>
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-main flex-shrink-0 mt-2" />
      )}
    </div>
  )
}

export default NotificationItem