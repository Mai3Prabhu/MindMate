'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, MessageCircle, Plus } from 'lucide-react'

interface Post {
  id: string
  emotion_label: string
  color_code: string | null
  short_text: string | null
  timestamp: string
  resonance_count: number
}

interface SymphonyFeedProps {
  posts: Post[]
  onSubmitPost: (emotion: string, text?: string) => Promise<void>
  onResonate: (postId: string) => Promise<void>
}

const emotions = [
  { label: 'joy', emoji: '😊', color: '#FFD700' },
  { label: 'calm', emoji: '😌', color: '#87CEEB' },
  { label: 'excited', emoji: '🤩', color: '#FF4500' },
  { label: 'grateful', emoji: '🙏', color: '#FFB6C1' },
  { label: 'hopeful', emoji: '🌟', color: '#98FB98' },
  { label: 'content', emoji: '😊', color: '#32CD32' },
  { label: 'peaceful', emoji: '☮️', color: '#E0E6FF' },
  { label: 'sadness', emoji: '😢', color: '#4169E1' },
  { label: 'anxious', emoji: '😰', color: '#9370DB' },
  { label: 'lonely', emoji: '😔', color: '#708090' },
  { label: 'overwhelmed', emoji: '😵', color: '#B22222' },
  { label: 'anger', emoji: '😠', color: '#DC143C' },
]

export default function SymphonyFeed({ posts, onSubmitPost, onResonate }: SymphonyFeedProps) {
  const [showComposer, setShowComposer] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [postText, setPostText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedEmotion) return

    setIsSubmitting(true)
    try {
      await onSubmitPost(selectedEmotion, postText.trim() || undefined)
      setPostText('')
      setSelectedEmotion('')
      setShowComposer(false)
    } catch (error) {
      console.error('Error submitting post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const diffMs = now.getTime() - postTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getEmotionData = (emotion: string) => {
    return emotions.find(e => e.label === emotion) || { emoji: '💭', color: '#888888' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-brand" />
          <div>
            <h2 className="text-xl font-bold">Symphony Feed</h2>
            <p className="text-sm text-gray-500">Anonymous emotional sharing</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="p-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 dark:bg-dark-deep rounded-xl"
          >
            <h3 className="font-semibold mb-3">Share your feeling</h3>
            
            {/* Emotion Selection */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {emotions.map((emotion) => (
                <button
                  key={emotion.label}
                  onClick={() => setSelectedEmotion(emotion.label)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    selectedEmotion === emotion.label
                      ? 'bg-brand text-white scale-105'
                      : 'bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  <div className="text-lg mb-1">{emotion.emoji}</div>
                  <div className="text-xs capitalize">{emotion.label}</div>
                </button>
              ))}
            </div>

            {/* Optional Text */}
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share more about how you're feeling... (optional)"
              className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card resize-none"
              rows={3}
              maxLength={280}
            />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {postText.length}/280 characters
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowComposer(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedEmotion || isSubmitting}
                  className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => {
              const emotionData = getEmotionData(post.emotion_label)
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${emotionData.color}20` }}
                    >
                      {emotionData.emoji}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ 
                            backgroundColor: `${emotionData.color}20`,
                            color: emotionData.color
                          }}
                        >
                          {post.emotion_label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(post.timestamp)}
                        </span>
                      </div>
                      
                      {post.short_text && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {post.short_text}
                        </p>
                      )}
                      
                      <button
                        onClick={() => onResonate(post.id)}
                        className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.resonance_count} resonating</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}