'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, TrendingUp, Clock, Calendar } from 'lucide-react'
import useSWR from 'swr'

interface Session {
  id: string
  theme: string
  voice_type: string
  duration_minutes: number
  time_of_day: string
  before_calmness: number
  after_calmness: number
  timestamp: string
}

interface SessionHistoryProps {
  onClose: () => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function SessionHistory({ onClose }: SessionHistoryProps) {
  const { data: sessions, error } = useSWR<Session[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/meditation/sessions?user_id=current`,
    fetcher
  )

  const isLoading = !sessions && !error

  const calculateImprovement = (before: number, after: number) => {
    const diff = after - before
    const percentage = ((diff / before) * 100).toFixed(0)
    return { diff, percentage }
  }

  const getThemeEmoji = (theme: string) => {
    const emojis: Record<string, string> = {
      nature: '🌲',
      ocean: '🌊',
      night: '🌙'
    }
    return emojis[theme] || '🧘'
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        initial={{ scale: 0.9, x: 300 }}
        animate={{ scale: 1, x: 0 }}
        exit={{ scale: 0.9, x: 300 }}
        className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 max-w-2xl w-full h-[80vh] border border-white/20 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Session History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats Summary */}
        {sessions && sessions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{sessions.length}</div>
              <div className="text-sm text-white/70">Total Sessions</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">
                {sessions.reduce((acc, s) => acc + s.duration_minutes, 0)}
              </div>
              <div className="text-sm text-white/70">Minutes</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">
                {(sessions.reduce((acc, s) => acc + (s.after_calmness - s.before_calmness), 0) / sessions.length).toFixed(1)}
              </div>
              <div className="text-sm text-white/70">Avg Improvement</div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-white/70">
              Failed to load sessions
            </div>
          )}

          {sessions && sessions.length === 0 && (
            <div className="text-center py-12 text-white/70">
              No meditation sessions yet. Start your first session!
            </div>
          )}

          {sessions && sessions.map((session) => {
            const improvement = calculateImprovement(session.before_calmness, session.after_calmness)
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getThemeEmoji(session.theme)}</div>
                    <div>
                      <div className="text-white font-medium capitalize">
                        {session.theme} • {session.time_of_day}
                      </div>
                      <div className="text-sm text-white/70 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {session.duration_minutes} min • {formatDate(session.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    improvement.diff > 0 
                      ? 'bg-green-500/20 text-green-300' 
                      : improvement.diff < 0
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-white/10 text-white/70'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {improvement.diff > 0 ? '+' : ''}{improvement.diff}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">Before:</span>
                    <span className="text-white font-medium">{session.before_calmness}/10</span>
                  </div>
                  <div className="text-white/50">→</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">After:</span>
                    <span className="text-white font-medium">{session.after_calmness}/10</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
