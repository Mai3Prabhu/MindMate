'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { feelFlowAPI } from '@/lib/api'
import { format, subDays, parseISO } from 'date-fns'

interface FeelingsChartProps {
  refreshTrigger?: number
}

const moodColors: Record<string, string> = {
  happy: '#F59E0B',
  anxious: '#A855F7',
  bored: '#9CA3AF',
  focused: '#3B82F6',
  sad: '#6366F1',
  calm: '#10B981',
  energetic: '#EF4444',
  stressed: '#F97316',
  neutral: '#6B7280',
}

export default function FeelingsChart({ refreshTrigger }: FeelingsChartProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30)
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMoods, setActiveMoods] = useState<string[]>([])

  useEffect(() => {
    loadChartData()
  }, [period, refreshTrigger])

  const loadChartData = async () => {
    try {
      setIsLoading(true)
      const moods = await feelFlowAPI.getHistory(period)
      
      // Group moods by date
      const moodsByDate: Record<string, Record<string, number[]>> = {}
      
      moods.forEach(mood => {
        const date = format(parseISO(mood.timestamp), 'MMM dd')
        
        if (!moodsByDate[date]) {
          moodsByDate[date] = {}
        }
        
        if (!moodsByDate[date][mood.label]) {
          moodsByDate[date][mood.label] = []
        }
        
        moodsByDate[date][mood.label].push(mood.intensity)
      })
      
      // Calculate averages and prepare chart data
      const dates = []
      const today = new Date()
      
      for (let i = period - 1; i >= 0; i--) {
        const date = subDays(today, i)
        const dateStr = format(date, 'MMM dd')
        dates.push(dateStr)
      }
      
      const data = dates.map(date => {
        const dayData: any = { date }
        
        if (moodsByDate[date]) {
          Object.entries(moodsByDate[date]).forEach(([mood, intensities]) => {
            const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length
            dayData[mood] = Math.round(avg)
          })
        }
        
        return dayData
      })
      
      // Determine which moods to show (those with data)
      const moodsWithData = new Set<string>()
      data.forEach(day => {
        Object.keys(day).forEach(key => {
          if (key !== 'date') {
            moodsWithData.add(key)
          }
        })
      })
      
      setActiveMoods(Array.from(moodsWithData))
      setChartData(data)
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (chartData.length === 0 || activeMoods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No mood data available for the selected period.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Start tracking your moods to see trends!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days as 7 | 30 | 90)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === days
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-dark-deep text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card'
            }`}
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={period === 7 ? 0 : period === 30 ? 4 : 14}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Intensity', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            {activeMoods.map((mood) => (
              <Line
                key={mood}
                type="monotone"
                dataKey={mood}
                stroke={moodColors[mood] || '#9CA3AF'}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
