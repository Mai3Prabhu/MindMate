'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, MessageCircle, Calendar, TrendingUp } from 'lucide-react'
import { therapyAPI } from '@/lib/api'
import { format } from 'date-fns'

interface TherapySession {
  id: string
  mode: string
  started_at: string
  ended_at?: string
  topics: string[]
  feeling_rating?: number
  key_insights?: string
  message_count: number
}

interface TherapyLogProps {
  onSessionSelect?: (sessionId: string) => void
  refreshTrigger?: number
}

export default function TherapyLog({ onSessionSelect, refreshTrigger }: TherapyLogProps) {
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await therapyAPI.getHistory(5)
      setSessions(data)
    } catch (err) {
      console.error('Error loading therapy history:', err)
      setError('Failed to load session history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      gentle: 'Gentle Listener',
      conversational: 'Conversational',
      silent: 'Silent Space',
    }
    return labels[mode] || mode
  }

  const getMoodColor = (rating?: number) => {
    if (!rating) return 'text-gray-400'
    if (rating >= 8) return 'text-green-500'
    if (rating >= 5) return 'text-yellow-500'
    return 'text-orange-500'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No sessions yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start your first therapy session to begin your journey
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
      
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSessionSelect?.(session.id)}
          className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-brand">
                  {getModeLabel(session.mode)}
                </span>
                {session.ended_at ? (
                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(session.started_at), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(session.started_at), 'h:mm a')}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {session.message_count} messages
                </div>
              </div>
            </div>
            
            {session.feeling_rating && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-4 h-4 ${getMoodColor(session.feeling_rating)}`} />
                <span className={`text-sm font-medium ${getMoodColor(session.feeling_rating)}`}>
                  {session.feeling_rating}/10
                </span>
              </div>
            )}
          </div>

          {session.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {session.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="text-xs px-2 py-1 bg-brand/10 text-brand rounded-full"
                >
                  {topic}
                </span>
              ))}
              {session.topics.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-deep text-gray-600 dark:text-gray-400 rounded-full">
                  +{session.topics.length - 3} more
                </span>
              )}
            </div>
          )}

          {session.key_insights && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {session.key_insights}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
