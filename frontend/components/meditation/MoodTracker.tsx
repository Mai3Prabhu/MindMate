'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface MoodTrackerProps {
  title: string
  onMoodSelect: (mood: number) => void
  onClose: () => void
}

const moodEmojis = [
  { value: 1, emoji: '😰', label: 'Very Stressed' },
  { value: 2, emoji: '😟', label: 'Stressed' },
  { value: 3, emoji: '😕', label: 'Uneasy' },
  { value: 4, emoji: '😐', label: 'Neutral' },
  { value: 5, emoji: '🙂', label: 'Calm' },
  { value: 6, emoji: '😌', label: 'Relaxed' },
  { value: 7, emoji: '😊', label: 'Peaceful' },
  { value: 8, emoji: '😄', label: 'Very Calm' },
  { value: 9, emoji: '🥰', label: 'Blissful' },
  { value: 10, emoji: '✨', label: 'Transcendent' },
]

export default function MoodTracker({ title, onMoodSelect, onClose }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [hoveredMood, setHoveredMood] = useState<number | null>(null)

  const handleSubmit = () => {
    if (selectedMood !== null) {
      onMoodSelect(selectedMood)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <p className="text-white/80 mb-6 text-center">
          Rate your calmness level from 1 (very stressed) to 10 (completely at peace)
        </p>

        {/* Mood Grid */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {moodEmojis.map((mood) => (
            <motion.button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              onMouseEnter={() => setHoveredMood(mood.value)}
              onMouseLeave={() => setHoveredMood(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-2xl border-2 transition-all ${
                selectedMood === mood.value
                  ? 'border-white bg-white/30 scale-105'
                  : 'border-white/30 bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-4xl mb-1">{mood.emoji}</div>
                <div className="text-xs text-white/70">{mood.value}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Mood Label */}
        <div className="text-center mb-6 h-6">
          {(hoveredMood !== null || selectedMood !== null) && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-medium"
            >
              {moodEmojis.find(m => m.value === (hoveredMood || selectedMood))?.label}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={selectedMood === null}
          className="w-full py-4 bg-gradient-to-r from-brand to-purple-500 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  )
}
