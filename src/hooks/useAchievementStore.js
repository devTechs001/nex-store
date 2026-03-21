// src/store/useAchievementStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ACHIEVEMENTS = [
  { id: 'first_download', name: 'First Download', description: 'Download your first app', icon: '⬇️', xp: 10, tier: 'bronze' },
  { id: 'download_5', name: 'App Collector', description: 'Download 5 apps', icon: '📦', xp: 25, tier: 'bronze' },
  { id: 'download_25', name: 'Power Downloader', description: 'Download 25 apps', icon: '🚀', xp: 100, tier: 'silver' },
  { id: 'download_100', name: 'Download Legend', description: 'Download 100 apps', icon: '👑', xp: 500, tier: 'gold' },
  { id: 'first_favorite', name: 'Heart Giver', description: 'Add your first favorite', icon: '❤️', xp: 10, tier: 'bronze' },
  { id: 'favorite_10', name: 'Curator', description: 'Favorite 10 apps', icon: '💎', xp: 50, tier: 'silver' },
  { id: 'first_review', name: 'Voice of Reason', description: 'Write your first review', icon: '📝', xp: 20, tier: 'bronze' },
  { id: 'review_10', name: 'Critic', description: 'Write 10 reviews', icon: '🎭', xp: 100, tier: 'silver' },
  { id: 'first_upload', name: 'Creator', description: 'Upload your first app', icon: '🎨', xp: 50, tier: 'bronze' },
  { id: 'upload_5', name: 'Prolific Dev', description: 'Upload 5 apps', icon: '💻', xp: 200, tier: 'silver' },
  { id: 'upload_verified', name: 'Verified Publisher', description: 'Get an app verified', icon: '✅', xp: 100, tier: 'silver' },
  { id: 'featured', name: 'Featured Star', description: 'Get featured on the homepage', icon: '⭐', xp: 500, tier: 'gold' },
  { id: 'collection_create', name: 'Organizer', description: 'Create a collection', icon: '📁', xp: 15, tier: 'bronze' },
  { id: 'streak_7', name: 'Weekly Warrior', description: 'Visit 7 days in a row', icon: '🔥', xp: 50, tier: 'bronze' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Visit 30 days in a row', icon: '🏆', xp: 200, tier: 'gold' },
  { id: 'explore_all_categories', name: 'Explorer', description: 'Visit all categories', icon: '🗺️', xp: 30, tier: 'bronze' },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join in the first month', icon: '🌟', xp: 100, tier: 'silver' },
  { id: 'social_share', name: 'Spreader', description: 'Share an app link', icon: '📢', xp: 10, tier: 'bronze' },
]

const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Newcomer' },
  { level: 2, xpRequired: 50, title: 'Explorer' },
  { level: 3, xpRequired: 150, title: 'Contributor' },
  { level: 4, xpRequired: 300, title: 'Enthusiast' },
  { level: 5, xpRequired: 500, title: 'Expert' },
  { level: 6, xpRequired: 800, title: 'Veteran' },
  { level: 7, xpRequired: 1200, title: 'Master' },
  { level: 8, xpRequired: 1800, title: 'Grand Master' },
  { level: 9, xpRequired: 2500, title: 'Legend' },
  { level: 10, xpRequired: 3500, title: 'AppStore Elite' },
]

export const useAchievementStore = create(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      totalXP: 0,
      streak: 0,
      lastVisit: null,
      pendingNotifications: [],

      getAllAchievements: () => ACHIEVEMENTS,
      getLevels: () => LEVELS,

      getCurrentLevel: () => {
        const { totalXP } = get()
        const level = [...LEVELS].reverse().find(l => totalXP >= l.xpRequired)
        return level || LEVELS[0]
      },

      getNextLevel: () => {
        const { totalXP } = get()
        const nextLevel = LEVELS.find(l => l.xpRequired > totalXP)
        return nextLevel || LEVELS[LEVELS.length - 1]
      },

      getProgress: () => {
        const { totalXP } = get()
        const current = get().getCurrentLevel()
        const next = get().getNextLevel()
        if (current.level === next.level) return 100
        const progress = ((totalXP - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100
        return Math.min(Math.max(progress, 0), 100)
      },

      unlock: (achievementId) => {
        const { unlockedAchievements } = get()
        if (unlockedAchievements.includes(achievementId)) return false

        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
        if (!achievement) return false

        set({
          unlockedAchievements: [...unlockedAchievements, achievementId],
          totalXP: get().totalXP + achievement.xp,
          pendingNotifications: [
            ...get().pendingNotifications,
            { achievement, timestamp: Date.now() },
          ],
        })
        return true
      },

      clearNotification: (timestamp) => {
        set({
          pendingNotifications: get().pendingNotifications.filter(n => n.timestamp !== timestamp),
        })
      },

      isUnlocked: (achievementId) => get().unlockedAchievements.includes(achievementId),

      checkStreak: () => {
        const { lastVisit, streak } = get()
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()

        if (lastVisit === today) return

        if (lastVisit === yesterday) {
          const newStreak = streak + 1
          set({ streak: newStreak, lastVisit: today })
          if (newStreak >= 7) get().unlock('streak_7')
          if (newStreak >= 30) get().unlock('streak_30')
        } else {
          set({ streak: 1, lastVisit: today })
        }
      },
    }),
    { name: 'achievements-storage' }
  )
)