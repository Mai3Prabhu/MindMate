'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Check, TrendingUp, Zap, Heart, Footprints, Clock, Save } from 'lucide-react'
import { wellnessAPI } from '@/lib/api'

interface MoveFlowModalProps {
  isOpen: boolean
  onClose: () => void
}

type ActivityType = 'workout' | 'mobility' | 'zumba'

type Activity = {
  id: ActivityType
  name: string
  icon: string
  description: string
  videos: {
    title: string
    url: string
  }[]
}

type LogSession = {
  activity_type: ActivityType
  duration: number
  intensity: 'low' | 'medium' | 'high'
  calories: number
}

type Stats = {
  todayMinutes: number
  weeklyStreak: number
  totalActivities: number
}

const activities: Activity[] = [
  {
    id: 'workout',
    name: 'Quick Workout',
    icon: '💪',
    description: 'High-intensity exercises',
    videos: [
      { title: '5-Min Full Body Workout', url: 'https://www.youtube.com/embed/gC_L9qAHVJ8' },
      { title: '10-Min HIIT Workout', url: 'https://www.youtube.com/embed/Nkqj-KQ2CJ8' },
      { title: '15-Min Bodyweight Workout', url: 'https://www.youtube.com/embed/8RbXIMZmVv8' }
    ]
  },
  {
    id: 'mobility',
    name: 'Mobility',
    icon: '🔄',
    description: 'Joint health and movement',
    videos: [
      { title: '10-Min Morning Mobility', url: 'https://www.youtube.com/embed/g_tea8ZNk5A' },
      { title: 'Full Body Stretch', url: 'https://www.youtube.com/embed/L_xrDAtykMI' },
      { title: 'Hip Mobility Routine', url: 'https://www.youtube.com/embed/lbozu0DPcYI' }
    ]
  },
  {
    id: 'zumba',
    name: 'Zumba',
    icon: '💃',
    description: 'Fun cardio dance workout',
    videos: [
      { title: '20-Min Zumba Workout', url: 'https://www.youtube.com/embed/BHy4eqEgqAE' },
      { title: 'Beginner Zumba Dance', url: 'https://www.youtube.com/embed/v7AYKMP6rOE' },
      { title: 'Latin Dance Cardio', url: 'https://www.youtube.com/embed/oe7qbMbOdeQ' }
    ]
  }
]

const calculateCalories = (duration: number, intensity: 'low' | 'medium' | 'high'): number => {
  const multipliers = { low: 3, medium: 5, high: 8 }
  return duration * multipliers[intensity]
}

export default function MoveFlowModal({ isOpen, onClose }: MoveFlowModalProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [logSession, setLogSession] = useState<LogSession>({
    activity_type: 'workout',
    duration: 10,
    intensity: 'medium',
    calories: 0
  })
  const [stats, setStats] = useState<Stats>({
    todayMinutes: 0,
    weeklyStreak: 0,
    totalActivities: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadStats()
    }
  }, [isOpen])

  useEffect(() => {
    setLogSession(prev => ({
      ...prev,
      calories: calculateCalories(prev.duration, prev.intensity)
    }))
  }, [logSession.duration, logSession.intensity])

  const loadStats = async () => {
    try {
      const response = await wellnessAPI.getActivityStats() as any
      setStats({
        todayMinutes: response.today_minutes || 0,
        weeklyStreak: response.current_streak || 0,
        totalActivities: response.today_activities || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity)
    setLogSession(prev => ({
      ...prev,
      activity_type: activity.id
    }))
    setShowLogModal(true)
  }

  const handleCancel = () => {
    setSelectedActivity(null)
    setShowLogModal(false)
    setLogSession({
      activity_type: 'workout',
      duration: 10,
      intensity: 'medium',
      calories: 0
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      // Optimistically update stats immediately
      setStats(prevStats => ({
        todayMinutes: prevStats.todayMinutes + logSession.duration,
        weeklyStreak: prevStats.weeklyStreak, // This will be updated by backend
        totalActivities: prevStats.totalActivities + 1
      }))

      await wellnessAPI.logMoveFlowActivity({
        activity_type: logSession.activity_type,
        duration_minutes: logSession.duration,
        intensity: logSession.intensity,
        calories: logSession.calories
      })
      
      // Refresh stats from backend to get accurate streak data
      await loadStats()
      
      // Show success animation
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        handleCancel()
      }, 1500)
      
    } catch (error) {
      console.error('Error saving activity:', error)
      
      // Show error to user
      alert(`Failed to save activity: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Revert optimistic update on error
      setStats(prevStats => ({
        todayMinutes: prevStats.todayMinutes - logSession.duration,
        weeklyStreak: prevStats.weeklyStreak,
        totalActivities: prevStats.totalActivities - 1
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const getIntensityColor = (intensity: string) => {
    if (intensity === 'low') return 'text-green-500 bg-green-500/20'
    if (intensity === 'medium') return 'text-yellow-500 bg-yellow-500/20'
    return 'text-red-500 bg-red-500/20'
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
            className="fixed inset-4 md:inset-10 bg-gradient-to-br from-green-50/95 via-white/95 to-emerald-50/95 dark:from-dark-card/95 dark:via-dark-bg/95 dark:to-green-900/20 backdrop-blur-xl rounded-3xl shadow-2xl z-[60] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Move & Flow</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Physical wellness activities
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
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div 
                  animate={showSuccess ? { scale: [1, 1.1, 1], backgroundColor: ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)'] } : {}}
                  transition={{ duration: 0.6 }}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Today</span>
                  </div>
                  <motion.div 
                    key={stats.todayMinutes}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold"
                  >
                    {stats.todayMinutes}
                  </motion.div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </motion.div>

                <motion.div 
                  animate={showSuccess ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Streak</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.weeklyStreak}</div>
                  <div className="text-xs text-gray-500">Days</div>
                </motion.div>

                <motion.div 
                  animate={showSuccess ? { scale: [1, 1.1, 1], backgroundColor: ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)'] } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
                  </div>
                  <motion.div 
                    key={stats.totalActivities}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold"
                  >
                    {stats.totalActivities}
                  </motion.div>
                  <div className="text-xs text-gray-500">Activities</div>
                </motion.div>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/30 rounded-lg">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                          Activity Logged! 🎉
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Great job! Your stats have been updated.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Suggestion */}
              {!showSuccess && (
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Footprints className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                        AI Suggestion
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        You've been sitting for a while. A 10-minute mobility session would help release tension.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Activity Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{activity.icon}</div>
                        <div>
                          <h4 className="font-bold">{activity.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleActivitySelect(activity)}
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:scale-105 transition-transform"
                      >
                        Log Activity
                      </button>
                    </div>

                    {/* YouTube Videos */}
                    <div className="p-4 space-y-3">
                      {activity.videos.map((video, index) => (
                        <div key={index} className="group">
                          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {video.title}
                          </h5>
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-deep">
                            <iframe
                              src={video.url}
                              title={video.title}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Activity Log Modal */}
          <AnimatePresence>
            {showLogModal && selectedActivity && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-[70] p-4"
                onClick={handleCancel}
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div
                  className="relative bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{selectedActivity.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">Log {selectedActivity.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Track your activity session
                    </p>

                    {/* Duration Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 15, 20].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => setLogSession(prev => ({ ...prev, duration }))}
                            className={`py-2 px-3 rounded-lg font-medium transition-all ${
                              logSession.duration === duration
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Intensity Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Intensity</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'medium', 'high'] as const).map((intensity) => (
                          <button
                            key={intensity}
                            onClick={() => setLogSession(prev => ({ ...prev, intensity }))}
                            className={`py-2 px-3 rounded-lg font-medium transition-all capitalize ${
                              logSession.intensity === intensity
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {intensity}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calories Display */}
                    <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Calories</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {logSession.calories}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
