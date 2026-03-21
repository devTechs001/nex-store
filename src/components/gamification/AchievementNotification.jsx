// src/components/gamification/AchievementNotification.jsx
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trophy, X, Star } from 'lucide-react'
import { useAchievementStore } from '../../store/useAchievementStore'

const AchievementNotification = () => {
  const { pendingNotifications, clearNotification } = useAchievementStore()
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    if (pendingNotifications.length > 0 && !current) {
      setCurrent(pendingNotifications[0])
    }
  }, [pendingNotifications, current])

  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => {
        clearNotification(current.timestamp)
        setCurrent(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [current])

  if (!current) return null

  const { achievement } = current
  const tierColors = {
    bronze: 'from-amber-700 to-amber-500',
    silver: 'from-gray-400 to-gray-200',
    gold: 'from-yellow-500 to-yellow-300',
  }

  return createPortal(
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`bg-gradient-to-r ${tierColors[achievement.tier]} p-0.5 rounded-2xl shadow-2xl`}>
        <div className="bg-bg-secondary rounded-2xl p-4 flex items-center gap-4 min-w-[320px]">
          <div className="w-14 h-14 rounded-xl bg-bg flex items-center justify-center text-3xl">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Achievement Unlocked!
              </span>
            </div>
            <p className="font-bold">{achievement.name}</p>
            <p className="text-sm text-text-muted">{achievement.description}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-main">
              <Star className="w-3 h-3" />
              +{achievement.xp} XP
            </div>
          </div>
          <button
            onClick={() => { clearNotification(current.timestamp); setCurrent(null) }}
            className="p-1 hover:bg-bg rounded-lg"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AchievementNotification