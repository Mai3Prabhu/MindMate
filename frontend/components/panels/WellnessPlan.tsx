'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Flame, Edit2, Check } from 'lucide-react'
import useSWR from 'swr'

interface WellnessPlan {
  id: string
  meditation_streak: number
  journal_streak: number
  breath_streak: number
  movement_streak: number
  last_meditation: string | null
  last_journal: string | null
  last_breath: string | null
  last_movement: string | null
}

interface WellnessPlanProps {
  isOpen: boolean
  onClose: () => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

const ACTIVITIES = [
  {
    key: 'meditation',
    label: 'Meditation',
    icon: '🧘',
    color: 'from-purple-500 to-pink-500',
    defaultGoal: 20,
  },
  {
    key: 'journal',
    label: 'Journaling',
    icon: '📝',
    color: 'from-blue-500 to-cyan-500',
    defaultGoal: 15,
  },
  {
    key: 'breath',
    label: 'Breathing',
    icon: '🌬️',
    color: 'from-green-500 to-emerald-500',
    defaultGoal: 10,
  },
  {
    key: 'movement',
    label: 'Movement',
    icon: '🏃',
    color: 'from-orange-500 to-red-500',
    defaultGoal: 30,
  },
]

export default function WellnessPlan({ isOpen, onClose }: WellnessPlanProps) {
  const [editMode, setEditMode] = useState(false)
  const [goals, setGoals] = useState<Record<string, number>>({})

  const { data: plan, mutate } = useSWR<WellnessPlan>(
    isOpen ? `${process.env.NEXT_PUBLIC_API_URL}/api/wellness-plan` : null,
    fetcher
  )

  const handleSaveGoals = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wellness-plan`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            meditation_goal: goals.meditation,
            journal_goal: goals.journal,
            breath_goal: goals.breath,
            movement_goal: goals.movement,
          }),
        }
      )

      if (response.ok) {
        setEditMode(false)
        mutate()
      }
    } catch (error) {
      console.error('Error saving goals:', error)
    }
  }

  const handleLogActivity = async (activityType: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wellness-plan/activity?activity_type=${activityType}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const getStreak = (key: string) => {
    if (!plan) return 0
    return plan[`${key}_streak` as keyof WellnessPlan] as number
  }

  const canLogToday = (key: string) => {
    if (!plan) return true
    const lastDate = plan[`last_${key}` as keyof WellnessPlan] as string | null
    if (!lastDate) return true
    
    const today = new Date().toISOString().split('T')[0]
    return lastDate !== today
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-dark-card shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Wellness Plan</h2>
                    <p className="text-sm text-gray-500">Track your daily goals</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <button
                      onClick={handleSaveGoals}
                      className="p-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditMode(true)
                        setGoals({
                          meditation: ACTIVITIES[0].defaultGoal,
                          journal: ACTIVITIES[1].defaultGoal,
                          breath: ACTIVITIES[2].defaultGoal,
                          movement: ACTIVITIES[3].defaultGoal,
                        })
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!plan && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" />
                </div>
              )}

              {plan && (
                <div className="space-y-6">
                  {ACTIVITIES.map((activity, index) => {
                    const streak = getStreak(activity.key)
                    const canLog = canLogToday(activity.key)

                    return (
                      <motion.div
                        key={activity.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card p-6"
                      >
                        {/* Activity Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center text-2xl`}
                            >
                              {activity.icon}
                            </div>
                            <div>
                              <h3 className="font-bold">{activity.label}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span>{streak} day streak</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLogActivity(activity.key)}
                            disabled={!canLog}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              canLog
                                ? 'bg-brand text-white hover:bg-brand-deep'
                                : 'bg-gray-200 dark:bg-dark-border text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {canLog ? 'Log Today' : 'Logged ✓'}
                          </button>
                        </div>

                        {/* Goal Setting */}
                        {editMode ? (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Daily Goal (minutes)
                            </label>
                            <input
                              type="number"
                              value={goals[activity.key] || activity.defaultGoal}
                              onChange={(e) =>
                                setGoals({
                                  ...goals,
                                  [activity.key]: parseInt(e.target.value) || 0,
                                })
                              }
                              min="0"
                              max={activity.key === 'movement' ? 120 : 60}
                              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-500">Daily Goal</span>
                              <span className="font-medium">
                                {activity.defaultGoal} min
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: canLog ? '0%' : '100%' }}
                                transition={{ duration: 0.5 }}
                                className={`h-2 rounded-full bg-gradient-to-r ${activity.color}`}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}

                  {/* Motivational Message */}
                  <div className="card p-6 bg-gradient-to-r from-brand/5 to-purple-500/5 border-2 border-brand/20">
                    <h3 className="font-bold mb-2">Keep Going! 🌟</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Consistency is key to building healthy habits. Even small steps
                      count toward your wellness journey.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
