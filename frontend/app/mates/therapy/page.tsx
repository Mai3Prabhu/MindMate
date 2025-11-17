'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, History, Download, X } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import TherapyChat from '@/components/therapy/TherapyChat'
import TherapyLog from '@/components/therapy/TherapyLog'
import SessionExport from '@/components/therapy/SessionExport'
import { therapyAPI } from '@/lib/api'

export default function TherapyPage() {
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [mode, setMode] = useState<'gentle' | 'conversational' | 'silent'>('conversational')
  const [showLog, setShowLog] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showEndSession, setShowEndSession] = useState(false)
  const [feelingRating, setFeelingRating] = useState<number>(5)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSessionCreated = (newSessionId: string) => {
    setSessionId(newSessionId)
  }

  const handleEndSession = async () => {
    if (!sessionId) return

    try {
      setIsEndingSession(true)
      await therapyAPI.closeSession(sessionId, feelingRating)
      
      setSessionId(undefined)
      setShowEndSession(false)
      setRefreshTrigger(prev => prev + 1)
      
      alert('Session ended successfully. Your reflection has been saved.')
    } catch (error) {
      console.error('Error ending session:', error)
      alert('Failed to end session. Please try again.')
    } finally {
      setIsEndingSession(false)
    }
  }

  const modes = [
    { value: 'gentle', label: 'Gentle Listener', description: 'Soft, validating responses' },
    { value: 'conversational', label: 'Conversational', description: 'Balanced, engaging dialogue' },
    { value: 'silent', label: 'Silent Space', description: 'Minimal responses, space to reflect' },
  ] as const

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-brand" />
            <div>
              <h1 className="text-3xl font-heading font-bold">Therapy Session</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered compassionate support
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowLog(!showLog)}
              className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </button>
            
            {sessionId && (
              <>
                <button
                  onClick={() => setShowExport(true)}
                  className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                
                <button
                  onClick={() => setShowEndSession(true)}
                  className="px-4 py-2 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep transition-colors"
                >
                  End Session
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {!sessionId && (
              <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Choose Your Mode</h2>
                <div className="grid gap-3">
                  {modes.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        mode === m.value
                          ? 'border-brand bg-brand/5'
                          : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
                      }`}
                    >
                      <div className="font-medium mb-1">{m.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {m.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-6 h-[600px]">
              <TherapyChat
                sessionId={sessionId}
                mode={mode}
                onSessionCreated={handleSessionCreated}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            {showLog ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Session History</h2>
                  <button
                    onClick={() => setShowLog(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <TherapyLog refreshTrigger={refreshTrigger} />
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">About Therapy</h2>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    This is a safe, judgment-free space to explore your thoughts and feelings.
                  </p>
                  <p>
                    Our AI companion uses context from your previous sessions to provide
                    personalized, empathetic support.
                  </p>
                  <div className="p-3 bg-brand/10 rounded-lg">
                    <p className="text-brand font-medium mb-1">Remember:</p>
                    <p className="text-xs">
                      This is not a replacement for professional mental health care.
                      If you're in crisis, please contact emergency services or a crisis helpline.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExport && sessionId && (
          <SessionExport
            sessionId={sessionId}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndSession && sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEndSession(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-heading font-bold mb-4">End Session</h2>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                How are you feeling after this session?
              </p>

              <div className="mb-6">
                <label className="text-sm font-medium block mb-3">
                  Rate your feeling (1-10)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFeelingRating(rating)}
                      className={`flex-1 aspect-square rounded-lg border-2 transition-all ${
                        feelingRating === rating
                          ? 'border-brand bg-brand text-white'
                          : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndSession(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors"
                  disabled={isEndingSession}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isEndingSession ? 'Ending...' : 'End Session'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
