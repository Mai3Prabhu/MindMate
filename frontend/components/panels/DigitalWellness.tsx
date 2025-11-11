'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WellnessMetric {
  id: string
  daily_screen_minutes: number
  app_usage_json: Record<string, number>
  detections: string[]
  date: string
}

interface BehaviorAnalysis {
  summary: string
  detections: string[]
  recommendations: string[]
  screen_time_trend: string
  risk_level: string
}

interface DigitalWellnessProps {
  isOpen: boolean
  onClose: () => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function DigitalWellness({ isOpen, onClose }: DigitalWellnessProps) {
  const [days, setDays] = useState(7)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const { data: metrics } = useSWR<WellnessMetric[]>(
    isOpen ? `${process.env.NEXT_PUBLIC_API_URL}/api/digital-wellness/metrics?days=${days}` : null,
    fetcher
  )

  const { data: analysis, mutate: refreshAnalysis } = useSWR<BehaviorAnalysis>(
    isOpen && showAnalysis
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/digital-wellness/analyze`
      : null,
    async (url) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ days }),
      })
      if (!response.ok) throw new Error('Failed to analyze')
      return response.json()
    }
  )

  const chartData = metrics
    ? metrics
        .slice()
        .reverse()
        .map((m) => ({
          date: new Date(m.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          hours: Math.round((m.daily_screen_minutes / 60) * 10) / 10,
        }))
    : []

  const avgScreenTime = metrics
    ? Math.round(
        metrics.reduce((sum, m) => sum + m.daily_screen_minutes, 0) / metrics.length / 60
      )
    : 0

  const topApps = metrics
    ? Object.entries(
        metrics.reduce((acc, m) => {
          Object.entries(m.app_usage_json).forEach(([app, minutes]) => {
            acc[app] = (acc[app] || 0) + minutes
          })
          return acc
        }, {} as Record<string, number>)
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : []

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'moderate':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      default:
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-dark-card shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Digital Wellness</h2>
                    <p className="text-sm text-gray-500">Screen time insights</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Time Range Selector */}
              <div className="flex gap-2">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      days === d
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Average Screen Time */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium">Average Daily Screen Time</h3>
                </div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {avgScreenTime}h
                </div>
                <p className="text-sm text-gray-500 mt-1">Last {days} days</p>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-medium mb-4">Screen Time Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="hours" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Apps */}
              {topApps.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-medium mb-4">Top Apps</h3>
                  <div className="space-y-3">
                    {topApps.map(([app, minutes]) => {
                      const hours = Math.round((minutes / 60) * 10) / 10
                      return (
                        <div key={app} className="flex items-center justify-between">
                          <span className="capitalize">{app}</span>
                          <span className="text-sm text-gray-500">{hours}h</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              <div className="card p-4">
                <button
                  onClick={() => {
                    setShowAnalysis(true)
                    refreshAnalysis()
                  }}
                  disabled={!metrics || metrics.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-brand to-purple-500 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Get AI Insights
                </button>
              </div>

              {/* Analysis Results */}
              {showAnalysis && analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Risk Level */}
                  <div className={`card p-4 ${getRiskColor(analysis.risk_level)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-medium">Risk Level: {analysis.risk_level}</h3>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="card p-4">
                    <h3 className="font-medium mb-2">Summary</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* Detections */}
                  {analysis.detections.length > 0 && (
                    <div className="card p-4">
                      <h3 className="font-medium mb-2">Detected Patterns</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.detections.map((detection) => (
                          <span
                            key={detection}
                            className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm"
                          >
                            {detection.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="card p-4">
                    <h3 className="font-medium mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-brand mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {metrics && metrics.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No screen time data available. Start tracking to see insights!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
