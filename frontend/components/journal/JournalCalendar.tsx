'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, TrendingUp } from 'lucide-react'
import { journalAPI } from '@/lib/api'

interface JournalCalendarProps {
  refreshTrigger?: number
}

export default function JournalCalendar({ refreshTrigger }: JournalCalendarProps) {
  const [streaks, setStreaks] = useState({
    current_streak: 0,
    longest_streak: 0,
    total_entries: 0,
    entries_by_date: {} as Record<string, number>
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStreaks()
  }, [refreshTrigger])

  const loadStreaks = async () => {
    try {
      setIsLoading(true)
      const data = await journalAPI.getStreaks()
      setStreaks(data)
    } catch (error) {
      console.error('Error loading streaks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-dark-deep'
    if (count === 1) return 'bg-brand/20'
    if (count === 2) return 'bg-brand/40'
    if (count === 3) return 'bg-brand/60'
    return 'bg-brand'
  }

  const getLast90Days = () => {
    const days = []
    const today = new Date()
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    
    return days
  }

  const days = getLast90Days()
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold">{streaks.current_streak}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand" />
            <span className="text-2xl font-bold">{streaks.longest_streak}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Longest Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold">{streaks.total_entries}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Entries</p>
        </motion.div>
      </div>

      {/* Heatmap */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-4">Last 90 Days</h3>
        
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            {/* Day labels */}
            <div className="flex gap-1 mb-1">
              <div className="w-6" />
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="w-3 text-[10px] text-gray-500 text-center">
                  {i % 2 === 0 ? day[0] : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {/* Week number */}
                <div className="w-6 text-[10px] text-gray-500 flex items-center">
                  {weekIndex % 4 === 0 ? `W${Math.floor(weekIndex / 4) + 1}` : ''}
                </div>
                
                {week.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const count = streaks.entries_by_date[dateStr] || 0
                  
                  return (
                    <motion.div
                      key={dayIndex}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(count)} cursor-pointer hover:ring-2 hover:ring-brand transition-all`}
                      title={`${dateStr}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
