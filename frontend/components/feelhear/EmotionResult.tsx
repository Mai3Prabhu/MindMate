'use client'

import { motion } from 'framer-motion'
import { Heart, Save, X, TrendingUp } from 'lucide-react'

interface EmotionResultProps {
  emotion: string
  intensity: number
  secondaryEmotions: string[]
  message: string
  onSave: () => void
  onDiscard: () => void
  isSaving?: boolean
}

const emotionEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  stressed: '😰',
  calm: '😌',
  neutral: '😐',
  anxious: '😟',
  excited: '🤩',
  angry: '😠',
}

const emotionColors: Record<string, string> = {
  happy: 'from-yellow-400 to-orange-400',
  sad: 'from-blue-400 to-indigo-400',
  stressed: 'from-red-400 to-orange-400',
  calm: 'from-green-400 to-teal-400',
  neutral: 'from-gray-400 to-gray-500',
  anxious: 'from-purple-400 to-pink-400',
  excited: 'from-pink-400 to-rose-400',
  angry: 'from-red-500 to-red-600',
}

export default function EmotionResult({
  emotion,
  intensity,
  secondaryEmotions,
  message,
  onSave,
  onDiscard,
  isSaving = false
}: EmotionResultProps) {
  const emoji = emotionEmojis[emotion.toLowerCase()] || '😐'
  const colorGradient = emotionColors[emotion.toLowerCase()] || 'from-gray-400 to-gray-500'

  const getIntensityLabel = (value: number) => {
    if (value >= 80) return 'Very Strong'
    if (value >= 60) return 'Strong'
    if (value >= 40) return 'Moderate'
    if (value >= 20) return 'Mild'
    return 'Subtle'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Emotion Display */}
      <div className="card p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${colorGradient} flex items-center justify-center text-7xl shadow-lg`}>
            {emoji}
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-heading font-bold mb-2 capitalize"
        >
          {emotion}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand" />
            <span className="text-lg font-semibold">
              {getIntensityLabel(intensity)}
            </span>
          </div>
          
          {/* Intensity Bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-3 bg-gray-200 dark:bg-dark-deep rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intensity}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`h-full bg-gradient-to-r ${colorGradient}`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium">{intensity}%</span>
              <span>100%</span>
            </div>
          </div>
        </motion.div>

        {/* Secondary Emotions */}
        {secondaryEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-500 mb-2">Also detected:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {secondaryEmotions.map((emotion, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm font-medium"
                >
                  {emotionEmojis[emotion.toLowerCase()] || '😐'} {emotion}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 bg-gradient-to-br from-brand/5 to-accent-teal/5 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
            <p className="text-left text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        <button
          onClick={onDiscard}
          disabled={isSaving}
          className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}
