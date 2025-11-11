'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Trophy, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface GameTrends {
  game_type: string
  scores: Array<{ score: number; timestamp: string }>
  average_score: number
  best_score: number
  total_plays: number
  ai_insight: string
}

interface ProgressVisualizationProps {
  gameType: string
  gameName: string
}

export default function ProgressVisualization({ gameType, gameName }: ProgressVisualizationProps) {
  const [trends, setTrends] = useState<GameTrends | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<7 | 30>(7)

  useEffect(() => {
    fetchTrends()
  }, [gameType, timeRange])

  const fetchTrends = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/braingym/trends/${gameType}?days=${timeRange}`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }

      const data = await response.json()
      setTrends(data)
    } catch (err) {
      console.error('Error fetching trends:', err)
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    )
  }

  if (!trends || trends.total_plays === 0) {
    return (
      <div className="card p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Play some games to see your progress!</p>
      </div>
    )
  }

  // Prepare chart data - group by day
  const chartData = prepareChartData(trends.scores, timeRange)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Trophy className="w-5 h-5 text-brand" />
            </div>
            <div className="text-sm text-gray-500">Best Score</div>
          </div>
          <div className="text-3xl font-bold">{trends.best_score}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-sm text-gray-500">Average</div>
          </div>
          <div className="text-3xl font-bold">{trends.average_score}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm text-gray-500">Total Plays</div>
          </div>
          <div className="text-3xl font-bold">{trends.total_plays}</div>
        </motion.div>
      </div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 bg-gradient-to-r from-brand/5 to-purple-500/5 border-2 border-brand/20"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium mb-1">AI Insight</h3>
            <p className="text-gray-700 dark:text-gray-300">{trends.ai_insight}</p>
          </div>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setTimeRange(7)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            timeRange === 7
              ? 'bg-brand text-white'
              : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-card'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange(30)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            timeRange === 30
              ? 'bg-brand text-white'
              : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-card'
          }`}
        >
          30 Days
        </button>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-medium mb-4">Score Progression</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="avgScore"
              fill="#9B7FFF"
              radius={[8, 8, 0, 0]}
              name="Average Score"
            />
            <Bar
              dataKey="maxScore"
              fill="#CABDFF"
              radius={[8, 8, 0, 0]}
              name="Best Score"
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-medium mb-4">Recent Scores</h3>
        <div className="space-y-2">
          {trends.scores.slice(0, 10).map((score, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-deep rounded-lg"
            >
              <span className="text-sm text-gray-500">
                {new Date(score.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="font-bold text-brand">{score.score}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Helper function to prepare chart data
function prepareChartData(scores: Array<{ score: number; timestamp: string }>, days: number) {
  const now = new Date()
  const data: Record<string, { date: string; scores: number[]; avgScore: number; maxScore: number }> = {}

  // Initialize all days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    data[dateKey] = {
      date: displayDate,
      scores: [],
      avgScore: 0,
      maxScore: 0,
    }
  }

  // Fill in scores
  scores.forEach((score) => {
    const dateKey = score.timestamp.split('T')[0]
    if (data[dateKey]) {
      data[dateKey].scores.push(score.score)
    }
  })

  // Calculate averages and max
  Object.keys(data).forEach((key) => {
    const dayData = data[key]
    if (dayData.scores.length > 0) {
      dayData.avgScore = Math.round(
        dayData.scores.reduce((a, b) => a + b, 0) / dayData.scores.length
      )
      dayData.maxScore = Math.max(...dayData.scores)
    }
  })

  return Object.values(data)
}
