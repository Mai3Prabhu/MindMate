'use client'

import { motion } from 'framer-motion'

interface MoodTagButtonsProps {
  selectedMood: string | null
  onMoodSelect: (mood: string) => void
  disabled?: boolean
}

const moods = [
  { label: 'happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
  { label: 'anxious', emoji: '😟', color: 'from-purple-400 to-pink-400' },
  { label: 'bored', emoji: '😑', color: 'from-gray-400 to-gray-500' },
  { label: 'focused', emoji: '🎯', color: 'from-blue-400 to-indigo-400' },
  { label: 'sad', emoji: '😢', color: 'from-blue-500 to-indigo-500' },
  { label: 'calm', emoji: '😌', color: 'from-green-400 to-teal-400' },
  { label: 'energetic', emoji: '⚡', color: 'from-orange-400 to-red-400' },
  { label: 'stressed', emoji: '😰', color: 'from-red-400 to-orange-500' },
  { label: 'neutral', emoji: '😐', color: 'from-gray-400 to-gray-500' },
]

export default function MoodTagButtons({
  selectedMood,
  onMoodSelect,
  disabled = false
}: MoodTagButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {moods.map((mood, index) => (
        <motion.button
          key={mood.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => !disabled && onMoodSelect(mood.label)}
          disabled={disabled}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedMood === mood.label
              ? `border-transparent bg-gradient-to-br ${mood.color} text-white shadow-lg`
              : 'border-gray-200 dark:border-dark-border hover:border-brand/50 bg-white dark:bg-dark-card'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-3xl mb-2">{mood.emoji}</div>
          <div className={`text-sm font-medium capitalize ${
            selectedMood === mood.label ? 'text-white' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {mood.label}
          </div>
        </motion.button>
      ))}
    </div>
  )
}
