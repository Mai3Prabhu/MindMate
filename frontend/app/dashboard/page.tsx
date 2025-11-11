'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AppLayout from '@/components/AppLayout'
import { Zap, TrendingUp, AlertCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const [moodData, setMoodData] = useState([
    { day: 'Mon', mood: 6 },
    { day: 'Tue', mood: 7 },
    { day: 'Wed', mood: 5 },
    { day: 'Thu', mood: 8 },
    { day: 'Fri', mood: 7 },
    { day: 'Sat', mood: 9 },
    { day: 'Sun', mood: 8 },
  ])

  const [stressScore, setStressScore] = useState(45)
  const [todayMood, setTodayMood] = useState({ emoji: '😊', text: 'Feeling Good', color: 'text-green-500' })

  const getStressLevel = (score: number) => {
    if (score <= 30) return { label: 'Calm', color: 'text-green-500', bg: 'bg-green-500' }
    if (score <= 60) return { label: 'Slight Stress', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    if (score <= 80) return { label: 'High Stress', color: 'text-orange-500', bg: 'bg-orange-500' }
    return { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500' }
  }

  const stressLevel = getStressLevel(stressScore)

  const insights = [
    { icon: TrendingUp, text: 'Your mood improved 15% this week', color: 'text-green-500' },
    { icon: Zap, text: 'Consider a quick meditation session', color: 'text-brand' },
    { icon: AlertCircle, text: '3 days since your last journal entry', color: 'text-yellow-500' },
  ]

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's how you're doing today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Mood */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Mood</h2>
            <div className="flex items-center gap-4">
              <div className="text-6xl">{todayMood.emoji}</div>
              <div>
                <p className={`text-xl font-medium ${todayMood.color}`}>
                  {todayMood.text}
                </p>
                <p className="text-sm text-gray-500">
                  Last updated: Just now
                </p>
              </div>
            </div>
          </div>

          {/* Stress Gauge */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Stress Level</h2>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - stressScore / 100)}`}
                    className={stressLevel.color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{stressScore}</span>
                </div>
              </div>
              <p className={`text-lg font-medium ${stressLevel.color}`}>
                {stressLevel.label}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">This Week</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Meditations</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Journal Entries</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Therapy Sessions</span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Mood Graph */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Weekly Mood Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={moodData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CABDFF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#CABDFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#CABDFF"
                fillOpacity={1}
                fill="url(#moodGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights & Guidance */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-6">Insights & Guidance</h2>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-dark-deep">
                <insight.icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-0.5`} />
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-brand/10 border border-brand/20">
            <p className="text-sm font-medium text-brand mb-2">💡 Personalized Tip</p>
            <p className="text-sm">
              Based on your current mood, we recommend starting with a 10-minute calming meditation or journaling about your day.
            </p>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  )
}
