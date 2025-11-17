'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Info } from 'lucide-react'
import useSWR from 'swr'
import AppLayout from '@/components/AppLayout'
import {
  ParticleSystem,
  GlobalMoodMap,
  SymphonyFeed,
  AmbientSound,
} from '@/components/symphony'

interface GlobalMoodData {
  total_posts: number
  emotion_distribution: Record<string, number>
  regional_moods: Record<string, Record<string, number>>
  recent_posts: Array<{
    id: string
    emotion_label: string
    color_code: string | null
    short_text: string | null
    timestamp: string
    resonance_count: number
  }>
  dominant_emotion: string | null
  mood_intensity: number
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
  return response.json()
}

export default function SymphonyPage() {
  const [showInfo, setShowInfo] = useState(false)

  const { data, error, mutate } = useSWR<GlobalMoodData>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/symphony/global?hours=24&limit=100`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const handleSubmitPost = async (emotion: string, text?: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/symphony/post`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            emotion_label: emotion,
            short_text: text,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit post')
      }

      mutate()
    } catch (error) {
      console.error('Error submitting post:', error)
      throw error
    }
  }

  const handleResonate = async (postId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/symphony/resonate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            post_id: postId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to resonate')
      }

      mutate()
    } catch (error) {
      console.error('Error resonating:', error)
      throw error
    }
  }

  const isLoading = !data && !error
  const moodData = data || {
    total_posts: 0,
    emotion_distribution: {},
    regional_moods: {},
    recent_posts: [],
    dominant_emotion: null,
    mood_intensity: 0,
  }

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 pointer-events-none opacity-30">
          <ParticleSystem
            emotions={moodData.emotion_distribution}
            intensity={moodData.mood_intensity}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-brand" />
              <div>
                <h1 className="text-3xl font-heading font-bold">Symphony</h1>
                <p className="text-sm text-gray-500">
                  Global Emotional Community
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-6 mb-6 bg-gradient-to-r from-brand/5 to-purple-500/5 border-2 border-brand/20"
            >
              <h3 className="font-bold mb-2">About Symphony</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Symphony is a safe, anonymous space where you can share your emotions
                and connect with others around the world. All contributions are
                completely anonymous - no personal information is shared.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Share your current emotional state</li>
                <li>• See global mood patterns in real-time</li>
                <li>• Resonate with others who feel the same way</li>
                <li>• Experience ambient sound that reflects collective emotions</li>
              </ul>
            </motion.div>
          )}

          {isLoading && (
            <div className="card p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
              <p className="text-gray-500">Loading global emotions...</p>
            </div>
          )}

          {error && (
            <div className="card p-8 text-center">
              <p className="text-red-500 mb-4">Failed to load Symphony data</p>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <GlobalMoodMap
                  emotionDistribution={moodData.emotion_distribution}
                  dominantEmotion={moodData.dominant_emotion}
                  totalPosts={moodData.total_posts}
                  moodIntensity={moodData.mood_intensity}
                />
              </div>

              <div>
                <SymphonyFeed
                  posts={moodData.recent_posts}
                  onSubmitPost={handleSubmitPost}
                  onResonate={handleResonate}
                />
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card rounded-full shadow-lg text-sm"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600 dark:text-gray-400">
                Live updates
              </span>
            </motion.div>
          )}
        </motion.div>

        {!isLoading && !error && (
          <AmbientSound
            intensity={moodData.mood_intensity}
            dominantEmotion={moodData.dominant_emotion}
          />
        )}
      </div>
    </AppLayout>
  )
}
