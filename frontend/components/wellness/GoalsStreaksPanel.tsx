'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Award, TrendingUp, Plus, Check } from 'lucide-react'

interface GoalsStreaksPanelProps {
  isOpen: boolean
  onClose: () => void
}

type Goal = {
  id: string
  title: string
  target: number
  current: number
  unit: string
  icon: string
  color: string
}

type Badge = {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress: number
}

export default function GoalsStreaksPanel({ isOpen, onClose }: GoalsStreaksPanelProps) {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Daily Meditation', target: 7, current: 5, unit: 'days/week', icon: '🧘', color: 'purple' },
    { id: '2', title: 'Weekly Journaling', target: 5, current: 3, unit: 'entries/week', icon: '📔', color: 'orange' },
    { id: '3', title: 'Breathing Sessions', target: 10, current: 7, unit: 'sessions/week', icon: '🌬️', color: 'cyan' },
  ])

  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'Calm Starter', description: 'Complete first meditation', icon: '🌟', earned: true, progress: 100 },
    { id: '2', name: 'Mindful Walker', description: '10 mindful walks', icon: '🚶', earned: true, progress: 100 },
    { id: '3', name: 'Inner Balance', description: '30 days streak', icon: '⚖️', earned: false, progress: 60 },
    { id: '4', name: 'Consistency King', description: '100 total sessions', icon: '👑', earned: false, progress: 45 },
    { id: '5', name: 'Breath Master', description: '50 breathing sessions', icon: '💨', earned: false, progress: 70 },
    { id: '6', name: 'Journal Hero', description: '30 journal entries', icon: '✍️', earned: false, progress: 80 },
  ])

  const [showAddGoal, setShowAddGoal] = useState(false)

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      cyan: 'from-cyan-400 to-cyan-600',
      green: 'from-green-400 to-green-600',
      pink: 'from-pink-400 to-pink-600',
    }
    return colors[color] || colors.purple
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 md:inset-10 bg-gradient-to-br from-yellow-50/95 via-white/95 to-orange-50/95 dark:from-dark-card/95 dark:via-dark-bg/95 dark:to-yellow-900/20 backdrop-blur-xl rounded-3xl shadow-2xl z-[60] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Goals & Streaks</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your progress and earn badges
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-deep transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-88px)] overflow-y-auto p-6 space-y-6">
              {/* Smart Goals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    Your Goals
                  </h4>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                </div>

                <div className="grid gap-4">
                  {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100
                    const isComplete = goal.current >= goal.target

                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-5 rounded-2xl border-2 transition-all ${
                          isComplete
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{goal.icon}</div>
                            <div>
                              <h5 className="font-semibold">{goal.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {goal.current} / {goal.target} {goal.unit}
                              </p>
                            </div>
                          </div>
                          {isComplete && (
                            <div className="p-2 bg-green-500 rounded-full">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-3 bg-gray-200 dark:bg-dark-deep rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${getColorClasses(goal.color)}`}
                          />
                        </div>

                        <div className="mt-2 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                          {Math.round(progress)}%
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Badges */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Achievement Badges
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-5 rounded-2xl text-center transition-all ${
                        badge.earned
                          ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-500'
                          : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-gray-700 opacity-60'
                      }`}
                    >
                      {badge.earned && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="absolute -top-2 -right-2 p-1.5 bg-green-500 rounded-full"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}

                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h5 className="font-semibold text-sm mb-1">{badge.name}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {badge.description}
                      </p>

                      {!badge.earned && (
                        <div className="space-y-1">
                          <div className="h-1.5 bg-gray-200 dark:bg-dark-deep rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">{badge.progress}%</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="p-6 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Weekly Progress
                </h4>

                {/* Blooming Flowers Animation */}
                <div className="flex items-end justify-around h-32 mb-4">
                  {[...Array(7)].map((_, i) => {
                    const height = Math.random() * 60 + 40
                    const hasActivity = i < 5 // Mock data

                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="flex flex-col items-center"
                      >
                        {hasActivity && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: i * 0.1 + 0.3, type: 'spring' }}
                            className="text-2xl mb-1"
                          >
                            🌸
                          </motion.div>
                        )}
                        <div
                          className={`w-3 rounded-t-full ${
                            hasActivity ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{ height: hasActivity ? `${height}px` : '20px' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  5 out of 7 days active this week 🌟
                </div>
              </div>

              {/* Circular Progress Dial */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Meditation', value: 75, color: 'purple' },
                  { label: 'Movement', value: 60, color: 'green' },
                  { label: 'Journaling', value: 85, color: 'orange' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 40 * (1 - item.value / 100),
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`text-${item.color}-500`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{item.value}%</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
