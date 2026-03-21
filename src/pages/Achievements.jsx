// src/pages/Achievements.jsx
import React from 'react'
import { Trophy, Star, Lock, Check, Zap } from 'lucide-react'
import { useAchievementStore } from '../store/useAchievementStore'
import { Badge, Progress } from '../components/common'

const Achievements = () => {
  const { 
    getAllAchievements, isUnlocked, totalXP, streak,
    getCurrentLevel, getNextLevel, getProgress, unlockedAchievements 
  } = useAchievementStore()

  const achievements = getAllAchievements()
  const currentLevel = getCurrentLevel()
  const nextLevel = getNextLevel()
  const progress = getProgress()

  const tiers = [
    { id: 'bronze', label: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-600/20' },
    { id: 'silver', label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-300/20' },
    { id: 'gold', label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  ]

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="title">Achievements</h1>

      {/* Level Card */}
      <div className="card bg-gradient-to-r from-main/20 via-purple-500/10 to-pink-500/10 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-main/20 flex items-center justify-center border-4 border-main">
            <span className="text-4xl font-bold text-main">{currentLevel.level}</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-text-muted">Level {currentLevel.level}</p>
            <h2 className="text-2xl font-bold mb-2">{currentLevel.title}</h2>
            <div className="flex items-center gap-4 justify-center md:justify-start text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-main" />
                {totalXP} XP total
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                {streak} day streak
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-purple-400" />
                {unlockedAchievements.length}/{achievements.length} unlocked
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Level {currentLevel.level}</span>
                <span>Level {nextLevel.level}</span>
              </div>
              <Progress value={progress} variant="gradient" size="md" />
              <p className="text-xs text-text-muted mt-1">
                {nextLevel.xpRequired - totalXP} XP to next level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Grid by Tier */}
      {tiers.map(tier => {
        const tierAchievements = achievements.filter(a => a.tier === tier.id)
        const unlockedCount = tierAchievements.filter(a => isUnlocked(a.id)).length

        return (
          <div key={tier.id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${tier.color}`}>
                <Trophy className="w-6 h-6" />
                {tier.label} ({unlockedCount}/{tierAchievements.length})
              </h2>
              <Progress 
                value={(unlockedCount / tierAchievements.length) * 100} 
                size="sm" 
                className="w-32"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierAchievements.map(achievement => {
                const unlocked = isUnlocked(achievement.id)
                return (
                  <div
                    key={achievement.id}
                    className={`card transition-all ${
                      unlocked 
                        ? 'border-2 border-main/30' 
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                        unlocked ? tier.bg : 'bg-bg'
                      }`}>
                        {unlocked ? achievement.icon : <Lock className="w-6 h-6 text-text-muted" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          {unlocked && <Check className="w-4 h-4 text-green-400" />}
                        </div>
                        <p className="text-sm text-text-muted">{achievement.description}</p>
                        <Badge variant={unlocked ? 'primary' : 'default'} size="xs" className="mt-2">
                          <Star className="w-3 h-3 mr-1" />
                          {achievement.xp} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Achievements