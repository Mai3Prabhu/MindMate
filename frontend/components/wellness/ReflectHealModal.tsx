'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReflectHealModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToJournal?: () => void
}

const journalPrompts = [
  "What made you smile today?",
  "One thing you want to release?",
  "What's one small win today?",
  "What are you grateful for right now?",
  "How did you show kindness today?",
  "What challenged you and what did you learn?",
  "Describe a moment of peace you experienced.",
  "What would make tomorrow better?",
]

const emotions = [
  { name: 'Joy', color: 'bg-yellow-400', emoji: '😊' },
  { name: 'Calm', color: 'bg-blue-400', emoji: '😌' },
  { name: 'Excited', color: 'bg-orange-400', emoji: '🤩' },
  { name: 'Grateful', color: 'bg-green-400', emoji: '🙏' },
  { name: 'Sad', color: 'bg-indigo-400', emoji: '😢' },
  { name: 'Anxious', color: 'bg-purple-400', emoji: '😰' },
  { name: 'Angry', color: 'bg-red-400', emoji: '😠' },
  { name: 'Peaceful', color: 'bg-teal-400', emoji: '☮️' },
]

export default function ReflectHealModal({ isOpen, onClose, onNavigateToJournal }: ReflectHealModalProps) {
  const router = useRouter()
  const [currentPrompt, setCurrentPrompt] = useState(journalPrompts[0])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [weeklyInsight, setWeeklyInsight] = useState(
    "This week, you've shown remarkable resilience. Your journal entries reflect a journey of self-discovery and growth. Keep nurturing your emotional wellness."
  )

  const rotatePrompt = () => {
    const currentIndex = journalPrompts.indexOf(currentPrompt)
    const nextIndex = (currentIndex + 1) % journalPrompts.length
    setCurrentPrompt(journalPrompts[nextIndex])
  }

  const handleOpenJournal = () => {
    onClose()
    if (onNavigateToJournal) {
      onNavigateToJournal()
    } else {
      router.push('/journal')
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
            className="fixed inset-4 md:inset-10 bg-gradient-to-br from-orange-50/95 via-white/95 to-rose-50/95 dark:from-dark-card/95 dark:via-dark-bg/95 dark:to-orange-900/20 backdrop-blur-xl rounded-3xl shadow-2xl z-[60] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Reflect & Heal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Journal & emotional wellness
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
              {/* Quick Journal Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleOpenJournal}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 p-8 text-white hover:scale-[1.02] transition-transform"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-2xl font-bold mb-2">Open Journal</h4>
                    <p className="text-white/90">Start writing your thoughts</p>
                  </div>
                  <BookOpen className="w-12 h-12 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>

              {/* Journal Prompt */}
              <div className="p-6 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold">Today's Prompt</h4>
                  <button
                    onClick={rotatePrompt}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <motion.p
                  key={currentPrompt}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-gray-700 dark:text-gray-300 italic"
                >
                  "{currentPrompt}"
                </motion.p>
              </div>

              {/* Emotion Wheel */}
              <div>
                <h4 className="font-semibold mb-3">How are you feeling?</h4>
                <div className="grid grid-cols-4 gap-3">
                  {emotions.map((emotion) => (
                    <motion.button
                      key={emotion.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedEmotion(emotion.name)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedEmotion === emotion.name
                          ? `${emotion.color} text-white scale-105`
                          : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{emotion.emoji}</div>
                      <div className="text-xs font-medium">{emotion.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* AI Weekly Summary */}
              <div className="p-6 bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                      Weekly Emotional Summary
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {weeklyInsight}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Reflection */}
              <div className="p-6 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-4">This Week's Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium text-sm">Most Common Emotion</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Grateful (5 times)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium text-sm">Journal Streak</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">7 days in a row 🔥</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium text-sm">Growth Moment</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        You've been more mindful of your emotions
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500/50 transition-all text-left">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-sm">View Trends</div>
                  <div className="text-xs text-gray-500">Emotion patterns</div>
                </button>
                <button className="p-4 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500/50 transition-all text-left">
                  <div className="text-2xl mb-2">💭</div>
                  <div className="font-medium text-sm">Past Entries</div>
                  <div className="text-xs text-gray-500">Read & reflect</div>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
