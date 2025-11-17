'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Moon, Sun, Waves, TrendingUp, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PeaceHubModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToMeditation?: () => void
}

export default function PeaceHubModal({ isOpen, onClose, onNavigateToMeditation }: PeaceHubModalProps) {
  const router = useRouter()
  const [beforeMood, setBeforeMood] = useState(5)
  const [afterMood, setAfterMood] = useState(5)
  const [showMoodTracker, setShowMoodTracker] = useState(false)

  // Mock stats - replace with real data
  const stats = {
    totalMinutes: 245,
    sessionsThisWeek: 5,
    bestTime: 'Evening',
    favoriteTheme: 'Nature',
    averageImprovement: 2.3
  }

  const themes = [
    { id: 'nature', name: 'Nature', icon: '🌲', color: 'from-green-400 to-emerald-500' },
    { id: 'ocean', name: 'Ocean', icon: '🌊', color: 'from-blue-400 to-cyan-500' },
    { id: 'night', name: 'Night', icon: '🌙', color: 'from-purple-400 to-indigo-500' },
  ]

  const suggestions = [
    {
      emotion: 'anxious',
      message: 'Feeling anxious? Try a Nature meditation to ground yourself.',
      theme: 'nature'
    },
    {
      emotion: 'tired',
      message: 'Feeling tired? Night meditation helps you settle and relax.',
      theme: 'night'
    },
    {
      emotion: 'stressed',
      message: 'Feeling stressed? Ocean sounds can help you find calm.',
      theme: 'ocean'
    }
  ]

  const handleStartMeditation = () => {
    onClose()
    if (onNavigateToMeditation) {
      onNavigateToMeditation()
    } else {
      router.push('/mates/meditation')
    }
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
            className="fixed inset-4 md:inset-10 bg-gradient-to-br from-purple-50/95 via-white/95 to-pink-50/95 dark:from-dark-card/95 dark:via-dark-bg/95 dark:to-purple-900/20 backdrop-blur-xl rounded-3xl shadow-2xl z-[60] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Peace Hub</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Meditation & mindfulness center
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
              {/* Quick Start */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleStartMeditation}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white hover:scale-[1.02] transition-transform"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-2xl font-bold mb-2">Start Meditation</h4>
                    <p className="text-white/90">Begin your mindfulness journey</p>
                  </div>
                  <Play className="w-12 h-12 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                  <Clock className="w-5 h-5 text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">{stats.totalMinutes}</div>
                  <div className="text-xs text-gray-500">Total Minutes</div>
                </div>

                <div className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                  <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                  <div className="text-2xl font-bold">{stats.sessionsThisWeek}</div>
                  <div className="text-xs text-gray-500">This Week</div>
                </div>

                <div className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                  <Moon className="w-5 h-5 text-indigo-500 mb-2" />
                  <div className="text-lg font-bold">{stats.bestTime}</div>
                  <div className="text-xs text-gray-500">Best Time</div>
                </div>

                <div className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                  <Waves className="w-5 h-5 text-cyan-500 mb-2" />
                  <div className="text-lg font-bold">{stats.favoriteTheme}</div>
                  <div className="text-xs text-gray-500">Favorite</div>
                </div>
              </div>

              {/* Mood Tracker */}
              <div className="p-6 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-4">How do you feel?</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Before meditation</span>
                      <span className="text-sm font-medium">{beforeMood}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={beforeMood}
                      onChange={(e) => setBeforeMood(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-dark-deep rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">After meditation</span>
                      <span className="text-sm font-medium">{afterMood}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={afterMood}
                      onChange={(e) => setAfterMood(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-dark-deep rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {afterMood > beforeMood && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-700 dark:text-green-400">
                      Great! You improved by {afterMood - beforeMood} points 🎉
                    </div>
                  )}
                </div>
              </div>

              {/* AI Suggestions */}
              <div>
                <h4 className="font-semibold mb-3">Personalized Suggestions</h4>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.message}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Theme Preferences */}
              <div>
                <h4 className="font-semibold mb-3">Meditation Themes</h4>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      className={`p-4 rounded-xl text-center transition-all bg-gradient-to-br ${theme.color} text-white hover:scale-105`}
                    >
                      <div className="text-3xl mb-2">{theme.icon}</div>
                      <div className="text-sm font-medium">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
