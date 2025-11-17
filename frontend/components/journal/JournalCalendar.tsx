'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flame, Target, Calendar } from 'lucide-react'
import { journalAPI } from '@/lib/api'

interface JournalCalendarProps {
  refreshTrigger: number
}

interface DayData {
  date: string
  hasEntry: boolean
  wordCount: number
  moodTag?: string
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  thisMonthEntries: number
}

const moodEmojis: Record<string, string> = {
  'Happy': '😊',
  'Calm': '😌',
  'Excited': '🤩',
  'Grateful': '🙏',
  'Reflective': '🤔',
  'Anxious': '😰',
  'Sad': '😢',
  'Peaceful': '☮️'
}

export default function JournalCalendar({ refreshTrigger }: JournalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    thisMonthEntries: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
  }, [currentDate, refreshTrigger])

  const loadCalendarData = async () => {
    setIsLoading(true)
    try {
      // Get calendar data for the current month
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      const [calendar, streak] = await Promise.all([
        journalAPI.getCalendar(year, month),
        journalAPI.getStreak()
      ])
      
      setCalendarData(calendar)
      setStreakData(streak)
    } catch (error) {
      console.error('Error loading calendar data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = calendarData.find(d => d.date === dateStr)
      
      days.push({
        day,
        date: dateStr,
        hasEntry: dayData?.hasEntry || false,
        wordCount: dayData?.wordCount || 0,
        moodTag: dayData?.moodTag,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Current Streak</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {streakData.currentStreak}
          </div>
          <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
            {streakData.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Best Streak</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {streakData.longestStreak}
          </div>
          <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
            {streakData.longestStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand" />
          <h3 className="text-lg font-semibold">{getMonthYear()}</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`aspect-square p-1 text-center relative ${
                  day ? 'cursor-pointer' : ''
                }`}
              >
                {day && (
                  <div
                    className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-xs transition-all hover:scale-105 ${
                      day.isToday
                        ? 'bg-brand text-white font-bold'
                        : day.hasEntry
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-dark-deep text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card'
                    }`}
                  >
                    <span className="font-medium">{day.day}</span>
                    
                    {day.hasEntry && (
                      <div className="mt-1">
                        {day.moodTag && moodEmojis[day.moodTag] ? (
                          <span className="text-xs">{moodEmojis[day.moodTag]}</span>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-brand rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded" />
          <span>Entry</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-dark-deep rounded" />
          <span>No entry</span>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-deep rounded-xl text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-brand">{streakData.thisMonthEntries}</span> entries this month
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Total: {streakData.totalEntries} entries
        </div>
      </div>
    </motion.div>
  )
}