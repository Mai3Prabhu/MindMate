'use client'

import { motion } from 'framer-motion'
import { Globe, TrendingUp } from 'lucide-react'

interface GlobalMoodMapProps {
  emotionDistribution: Record<string, number>
  dominantEmotion: string | null
  totalPosts: number
  moodIntensity: number
}

export default function GlobalMoodMap({
  emotionDistribution,
  dominantEmotion,
  totalPosts,
  moodIntensity,
}: GlobalMoodMapProps) {
  const emotions = Object.entries(emotionDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) // Top 8 emotions

  const maxCount = emotions.length > 0 ? emotions[0][1] : 1

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Globe className="w-5 h-5 text-brand" />
            </div>
            <div className="text-sm text-gray-500">Total Feelings</div>
          </div>
          <div className="text-3xl font-bold">{totalPosts}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm text-gray-500">Dominant Emotion</div>
          </div>
          <div className="text-2xl font-bold capitalize">
            {dominantEmotion || 'N/A'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <div className="w-5 h-5 text-green-600 dark:text-green-400 font-bold">
                {Math.round(moodIntensity * 100)}%
              </div>
            </div>
            <div className="text-sm text-gray-500">Mood Intensity</div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${moodIntensity * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-brand to-purple-500 h-2 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Emotion Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-bold mb-4">Global Emotion Distribution</h3>
        
        {emotions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No emotions shared yet. Be the first to contribute!
          </p>
        ) : (
          <div className="space-y-3">
            {emotions.map(([emotion, count], index) => {
              const percentage = (count / maxCount) * 100
              const color = getEmotionColor(emotion)

              return (
                <motion.div
                  key={emotion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium capitalize">{emotion}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: '#FFD700',
    joyful: '#FFD700',
    excited: '#FF6B6B',
    calm: '#87CEEB',
    peaceful: '#87CEEB',
    relaxed: '#98D8C8',
    sad: '#4A90E2',
    anxious: '#9B59B6',
    stressed: '#E74C3C',
    angry: '#E74C3C',
    frustrated: '#FF8C42',
    bored: '#95A5A6',
    tired: '#7F8C8D',
    energetic: '#F39C12',
    focused: '#27AE60',
    grateful: '#F1C40F',
    hopeful: '#3498DB',
    lonely: '#34495E',
    confused: '#9B7FFF',
    neutral: '#BDC3C7',
  }

  return colors[emotion.toLowerCase()] || '#9B7FFF'
}
