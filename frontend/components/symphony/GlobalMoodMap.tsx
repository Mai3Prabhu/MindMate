'use client'

import { motion } from 'framer-motion'
import { Globe, TrendingUp, Users } from 'lucide-react'

interface GlobalMoodMapProps {
  emotionDistribution: Record<string, number>
  dominantEmotion: string | null
  totalPosts: number
  moodIntensity: number
}

const emotionEmojis: Record<string, string> = {
  joy: '😊',
  sadness: '😢',
  anger: '😠',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
  calm: '😌',
  excited: '🤩',
  anxious: '😰',
  content: '😊',
  lonely: '😔',
  grateful: '🙏',
  hopeful: '🌟',
  overwhelmed: '😵',
  peaceful: '☮️'
}

const emotionColors: Record<string, string> = {
  joy: '#FFD700',
  sadness: '#4169E1',
  anger: '#DC143C',
  fear: '#800080',
  surprise: '#FF69B4',
  disgust: '#228B22',
  calm: '#87CEEB',
  excited: '#FF4500',
  anxious: '#9370DB',
  content: '#32CD32',
  lonely: '#708090',
  grateful: '#FFB6C1',
  hopeful: '#98FB98',
  overwhelmed: '#B22222',
  peaceful: '#E0E6FF'
}

export default function GlobalMoodMap({
  emotionDistribution,
  dominantEmotion,
  totalPosts,
  moodIntensity
}: GlobalMoodMapProps) {
  const totalEmotions = Object.values(emotionDistribution).reduce((sum, count) => sum + count, 0)
  
  const sortedEmotions = Object.entries(emotionDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const getIntensityColor = (intensity: number) => {
    if (intensity > 0.8) return 'text-red-500'
    if (intensity > 0.6) return 'text-orange-500'
    if (intensity > 0.4) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity > 0.8) return 'Very High'
    if (intensity > 0.6) return 'High'
    if (intensity > 0.4) return 'Moderate'
    return 'Calm'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-6 h-6 text-brand" />
        <div>
          <h2 className="text-xl font-bold">Global Mood</h2>
          <p className="text-sm text-gray-500">Real-time emotional landscape</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-dark-deep rounded-xl">
          <Users className="w-5 h-5 text-brand mx-auto mb-1" />
          <div className="text-2xl font-bold">{totalPosts}</div>
          <div className="text-xs text-gray-500">Voices</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-dark-deep rounded-xl">
          <TrendingUp className="w-5 h-5 text-brand mx-auto mb-1" />
          <div className={`text-2xl font-bold ${getIntensityColor(moodIntensity)}`}>
            {getIntensityLabel(moodIntensity)}
          </div>
          <div className="text-xs text-gray-500">Intensity</div>
        </div>
      </div>

      {/* Dominant Emotion */}
      {dominantEmotion && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mb-6 p-4 bg-gradient-to-r from-brand/10 to-purple-500/10 rounded-xl border border-brand/20"
        >
          <div className="text-4xl mb-2">
            {emotionEmojis[dominantEmotion] || '💭'}
          </div>
          <div className="font-semibold capitalize text-brand">
            {dominantEmotion}
          </div>
          <div className="text-xs text-gray-500">Most felt emotion</div>
        </motion.div>
      )}

      {/* Emotion Distribution */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
          Emotional Spectrum
        </h3>
        
        {sortedEmotions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for global emotions...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEmotions.map(([emotion, count], index) => {
              const percentage = totalEmotions > 0 ? (count / totalEmotions) * 100 : 0
              
              return (
                <motion.div
                  key={emotion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <span className="text-lg">
                      {emotionEmojis[emotion] || '💭'}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {emotion}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: emotionColors[emotion] || '#888888',
                          opacity: 0.8
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 min-w-[40px] text-right">
                    {percentage.toFixed(1)}%
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pulse Animation for Live Updates */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 text-center"
      >
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          Live updates
        </div>
      </motion.div>
    </motion.div>
  )
}