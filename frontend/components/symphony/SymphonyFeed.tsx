'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SymphonyPost {
  id: string
  emotion_label: string
  color_code: string | null
  short_text: string | null
  timestamp: string
  resonance_count: number
}

interface SymphonyFeedProps {
  posts: SymphonyPost[]
  onSubmitPost: (emotion: string, text?: string) => Promise<void>
  onResonate: (postId: string) => Promise<void>
}

const EMOTION_OPTIONS = [
  { label: 'Happy', emoji: '😊', color: '#FFD700' },
  { label: 'Calm', emoji: '😌', color: '#87CEEB' },
  { label: 'Excited', emoji: '🤩', color: '#FF6B6B' },
  { label: 'Grateful', emoji: '🙏', color: '#F1C40F' },
  { label: 'Sad', emoji: '😢', color: '#4A90E2' },
  { label: 'Anxious', emoji: '😰', color: '#9B59B6' },
  { label: 'Stressed', emoji: '😫', color: '#E74C3C' },
  { label: 'Tired', emoji: '😴', color: '#7F8C8D' },
  { label: 'Focused', emoji: '🎯', color: '#27AE60' },
  { label: 'Hopeful', emoji: '🌟', color: '#3498DB' },
]

export default function SymphonyFeed({ posts, onSubmitPost, onResonate }: SymphonyFeedProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async () => {
    if (!selectedEmotion) return

    setIsSubmitting(true)
    try {
      await onSubmitPost(selectedEmotion, text || undefined)
      setSelectedEmotion(null)
      setText('')
      setShowForm(false)
    } catch (error) {
      console.error('Error submitting post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Contribution Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand" />
          <h3 className="text-lg font-bold">Share Your Feeling</h3>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-gradient-to-r from-brand to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Contribute to Symphony
          </button>
        ) : (
          <div className="space-y-4">
            {/* Emotion Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                How are you feeling?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {EMOTION_OPTIONS.map((emotion) => (
                  <button
                    key={emotion.label}
                    onClick={() => setSelectedEmotion(emotion.label.toLowerCase())}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedEmotion === emotion.label.toLowerCase()
                        ? 'border-brand bg-brand/10 scale-105'
                        : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
                    }`}
                    style={{
                      borderColor:
                        selectedEmotion === emotion.label.toLowerCase()
                          ? emotion.color
                          : undefined,
                    }}
                  >
                    <div className="text-2xl mb-1">{emotion.emoji}</div>
                    <div className="text-xs">{emotion.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Share more (optional)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
                placeholder="Express yourself in a few words..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none resize-none"
                rows={3}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {text.length}/200
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedEmotion(null)
                  setText('')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-deep rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedEmotion || isSubmitting}
                className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Share Anonymously
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Feed */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Community Feelings</h3>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No feelings shared yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-dark-deep rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: post.color_code || '#9B7FFF',
                          }}
                        />
                        <span className="font-medium capitalize">
                          {post.emotion_label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(post.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {post.short_text && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {post.short_text}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onResonate(post.id)}
                      className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors group"
                    >
                      <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
