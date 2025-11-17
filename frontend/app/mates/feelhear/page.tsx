'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, History, Loader2 } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import AudioRecorder from '@/components/feelhear/AudioRecorder'
import EmotionResult from '@/components/feelhear/EmotionResult'
import { feelHearAPI } from '@/lib/api'

interface AnalysisResult {
  sessionId: string
  emotion: string
  intensity: number
  secondaryEmotions: string[]
  message: string
}

export default function FeelHearPage() {
  const [step, setStep] = useState<'record' | 'analyzing' | 'result'>('record')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    setStep('analyzing')

    try {
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        const base64Data = base64Audio.split(',')[1]

        try {
          const result = await feelHearAPI.analyzeAudio(base64Data, duration)
          
          setAnalysisResult({
            sessionId: result.session_id,
            emotion: result.emotion,
            intensity: result.intensity,
            secondaryEmotions: result.secondary_emotions,
            message: result.message,
          })
          
          setStep('result')
        } catch (error) {
          console.error('Error analyzing audio:', error)
          alert('Failed to analyze audio. Please try again.')
          setStep('record')
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Failed to process audio. Please try again.')
      setStep('record')
    }
  }

  const handleSave = async () => {
    if (!analysisResult) return

    try {
      setIsSaving(true)
      await feelHearAPI.saveSession(analysisResult.sessionId)
      alert('Session saved successfully!')
      handleReset()
    } catch (error) {
      console.error('Error saving session:', error)
      alert('Failed to save session. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    handleReset()
  }

  const handleReset = () => {
    setStep('record')
    setAnalysisResult(null)
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mic className="w-8 h-8 text-brand" />
            <div>
              <h1 className="text-3xl font-heading font-bold">FeelHear</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Voice emotion analysis
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              const historySection = document.getElementById('analysis-history')
              if (historySection) {
                historySection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors flex items-center gap-2"
            aria-label="View analysis history"
          >
            <History className="w-4 h-4" aria-hidden="true" />
            History
          </button>
        </div>

        <div className="mb-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-2">How it works</h2>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex gap-2">
                <span className="font-semibold text-brand">1.</span>
                Record up to 30 seconds of your voice expressing how you feel
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-brand">2.</span>
                Our AI analyzes your voice for emotional content
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-brand">3.</span>
                Receive insights and supportive feedback
              </li>
            </ol>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AudioRecorder
                maxDuration={30}
                onRecordingComplete={handleRecordingComplete}
                onCancel={handleReset}
              />
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card p-12 text-center"
            >
              <Loader2 className="w-16 h-16 text-brand animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analyzing your voice...</h3>
              <p className="text-sm text-gray-500">
                Our AI is detecting emotional patterns in your recording
              </p>
            </motion.div>
          )}

          {step === 'result' && analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <EmotionResult
                emotion={analysisResult.emotion}
                intensity={analysisResult.intensity}
                secondaryEmotions={analysisResult.secondaryEmotions}
                message={analysisResult.message}
                onSave={handleSave}
                onDiscard={handleDiscard}
                isSaving={isSaving}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-brand/5 rounded-xl"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-brand">💡 Tip:</span> Speak naturally and express yourself freely. 
            The more authentic you are, the better the analysis will be.
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
