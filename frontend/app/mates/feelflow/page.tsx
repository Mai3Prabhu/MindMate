'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, TrendingUp, Download, Loader2, Sparkles } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import MoodTagButtons from '@/components/feelflow/MoodTagButtons'
import FeelingsChart from '@/components/feelflow/FeelingsChart'
import MoodExport from '@/components/feelflow/MoodExport'
import { feelFlowAPI } from '@/lib/api'

export default function FeelFlowPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(50)
  const [isLogging, setIsLogging] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleLogMood = async () => {
    if (!selectedMood) return

    try {
      setIsLogging(true)
      await feelFlowAPI.logMood({
        label: selectedMood,
        intensity,
      })
      
      setSelectedMood(null)
      setIntensity(50)
      setRefreshTrigger(prev => prev + 1)
      
      alert('Mood logged successfully!')
    } catch (error) {
      console.error('Error logging mood:', error)
      alert('Failed to log mood. Please try again.')
    } finally {
      setIsLogging(false)
    }
  }

  const handleGetInsights = async () => {
    try {
      setIsLoadingInsights(true)
      setShowInsights(true)
      const data = await feelFlowAPI.getInsights(30)
      setInsights(data)
    } catch (error) {
      console.error('Error getting insights:', error)
      alert('Failed to get insights. Please try again.')
      setShowInsights(false)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand" />
            <div>
              <h1 className="text-3xl font-heading font-bold">FeelFlow</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track and understand your emotional patterns
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleGetInsights}
              className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Insights
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">How are you feeling?</h2>
              
              <MoodTagButtons
                selectedMood={selectedMood}
                onMoodSelect={setSelectedMood}
                disabled={isLogging}
              />
              
              {selectedMood && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-sm font-medium block mb-2">
                    Intensity: {intensity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full"
                    disabled={isLogging}
                  />
                  
                  <button
                    onClick={handleLogMood}
                    disabled={isLogging}
                    className="w-full mt-4 px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isLogging ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      'Log Mood'
                    )}
                  </button>
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {showInsights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      AI Insights
                    </h3>
                    <button
                      onClick={() => setShowInsights(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  {isLoadingInsights ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-brand animate-spin" />
                    </div>
                  ) : insights ? (
                    <div className="space-y-4 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        {insights.insights}
                      </p>
                      
                      {insights.patterns.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Patterns:</p>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            {insights.patterns.map((pattern: string, i: number) => (
                              <li key={i}>• {pattern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {insights.suggestions.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Suggestions:</p>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            {insights.suggestions.map((suggestion: string, i: number) => (
                              <li key={i}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-semibold">Mood Trends</h2>
            </div>
            
            <FeelingsChart refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExport && (
          <MoodExport onClose={() => setShowExport(false)} />
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
