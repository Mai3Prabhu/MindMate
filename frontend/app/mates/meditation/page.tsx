'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Headphones, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Maximize, 
  Settings,
  Sparkles,
  Clock
} from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import MeditationPlayer from '@/components/meditation/MeditationPlayer'
import MoodTracker from '@/components/meditation/MoodTracker'
import SessionHistory from '@/components/meditation/SessionHistory'

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night'
type VoiceType = 'male' | 'female' | 'silent'
type Theme = 'nature' | 'ocean' | 'night'

interface SessionConfig {
  theme: Theme
  voiceType: VoiceType
  duration: number
  timePeriod: TimePeriod
}

const getTimePeriod = (): TimePeriod => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 21) return 'evening'
  return 'night'
}

const getGreeting = (period: TimePeriod): string => {
  const greetings = {
    morning: "Good morning, let's awaken your energy.",
    afternoon: "Midday calm check-in.",
    evening: "Evening unwind.",
    night: "Prepare for rest."
  }
  return greetings[period]
}

const getClosingMessage = (period: TimePeriod): string => {
  const messages = {
    morning: "Carry this calm energy with you.",
    afternoon: "Take this clarity forward.",
    evening: "Let go of today's noise.",
    night: "Rest easy and sleep peacefully."
  }
  return messages[period]
}

export default function MeditationZonePage() {
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMoodTracker, setShowMoodTracker] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [beforeMood, setBeforeMood] = useState<number | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    theme: 'nature',
    voiceType: 'female',
    duration: 10,
    timePeriod: getTimePeriod()
  })

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Auto-select theme based on time
    const period = getTimePeriod()
    setSessionConfig(prev => ({
      ...prev,
      timePeriod: period,
      theme: period === 'morning' ? 'nature' : period === 'night' ? 'night' : 'ocean'
    }))
  }, [])

  const handleStartSession = () => {
    if (beforeMood === null) {
      setShowMoodTracker(true)
    } else {
      setSessionStarted(true)
    }
  }

  const handleMoodSelected = (mood: number) => {
    setBeforeMood(mood)
    setShowMoodTracker(false)
    setSessionStarted(true)
  }

  const handleSessionEnd = async (afterMood: number) => {
    // Save session to backend
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meditation/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          theme: sessionConfig.theme,
          voice_type: sessionConfig.voiceType,
          duration_minutes: sessionConfig.duration,
          time_of_day: sessionConfig.timePeriod,
          before_calmness: beforeMood,
          after_calmness: afterMood,
        }),
      })

      if (response.ok) {
        console.log('Session saved successfully')
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }

    // Reset state
    setSessionStarted(false)
    setBeforeMood(null)
  }



  const themes = [
    { value: 'nature' as Theme, label: 'Nature', emoji: '🌲', description: 'Forest sounds and birds' },
    { value: 'ocean' as Theme, label: 'Ocean', emoji: '🌊', description: 'Waves and seagulls' },
    { value: 'night' as Theme, label: 'Night', emoji: '🌙', description: 'Crickets and calm' },
  ]

  const durations = [5, 10, 20, 30]

  return (
    <AppLayout>
      <div className="relative min-h-screen -m-6">
        {/* Background Video/Image */}
        <div className="fixed inset-0 -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-75"
            poster={`/meditation-scenes/${sessionConfig.theme}/bg.jpg`}
          >
            <source src={`/meditation-scenes/${sessionConfig.theme}/${sessionConfig.theme}.mp4`} type="video/mp4" />
          </video>
          <img
            src={`/meditation-scenes/${sessionConfig.theme}/bg.jpg`}
            alt={sessionConfig.theme}
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className={`p-6 flex items-center justify-between backdrop-blur-md ${
            isDark ? 'bg-white/10' : 'bg-black/10'
          }`}>
            <div className="flex items-center gap-3">
              <Headphones className={`w-8 h-8 drop-shadow-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`} />
              <div>
                <h1 className={`text-3xl font-heading font-bold drop-shadow-lg ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Meditation Zone
                </h1>
                <p className={`text-sm drop-shadow ${
                  isDark ? 'text-white/90' : 'text-gray-700'
                }`}>
                  {getGreeting(sessionConfig.timePeriod)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-2 backdrop-blur-md rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isDark 
                    ? 'bg-white/20 hover:bg-white/30 text-white' 
                    : 'bg-black/10 hover:bg-black/20 text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-4 py-2 backdrop-blur-md rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isDark 
                    ? 'bg-white/20 hover:bg-white/30 text-white' 
                    : 'bg-black/10 hover:bg-black/20 text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
              {!sessionStarted ? (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl"
                >
                  <div className={`backdrop-blur-xl rounded-3xl p-8 border shadow-2xl ${
                    isDark 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/90 border-gray-200'
                  }`}>
                    <h2 className={`text-2xl font-bold mb-6 text-center ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Customize Your Experience
                    </h2>

                    {/* Theme Selection */}
                    <div className="mb-6">
                      <label className={`font-medium mb-3 block ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Choose Your Scene
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {themes.map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => setSessionConfig(prev => ({ ...prev, theme: theme.value }))}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              sessionConfig.theme === theme.value
                                ? isDark 
                                  ? 'border-white bg-white/20 scale-105'
                                  : 'border-brand bg-brand/10 scale-105'
                                : isDark
                                  ? 'border-white/30 bg-white/5 hover:bg-white/10'
                                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="text-4xl mb-2">{theme.emoji}</div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{theme.label}</div>
                            <div className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{theme.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Selection */}
                    <div className="mb-6">
                      <label className={`font-medium mb-3 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Voice Guidance
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['male', 'female', 'silent'] as VoiceType[]).map((voice) => (
                          <button
                            key={voice}
                            onClick={() => setSessionConfig(prev => ({ ...prev, voiceType: voice }))}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              sessionConfig.voiceType === voice
                                ? isDark
                                  ? 'border-white bg-white/20'
                                  : 'border-brand bg-brand/10'
                                : isDark
                                  ? 'border-white/30 bg-white/5 hover:bg-white/10'
                                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{voice}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="mb-8">
                      <label className={`font-medium mb-3 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Duration (minutes)
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {durations.map((duration) => (
                          <button
                            key={duration}
                            onClick={() => setSessionConfig(prev => ({ ...prev, duration }))}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              sessionConfig.duration === duration
                                ? isDark
                                  ? 'border-white bg-white/20'
                                  : 'border-brand bg-brand/10'
                                : isDark
                                  ? 'border-white/30 bg-white/5 hover:bg-white/10'
                                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{duration}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={handleStartSession}
                      className="w-full py-4 bg-gradient-to-r from-brand to-purple-500 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Enter Meditation Zone
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-4xl"
                >
                  <MeditationPlayer
                    config={sessionConfig}
                    onSessionEnd={handleSessionEnd}
                    closingMessage={getClosingMessage(sessionConfig.timePeriod)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Info */}
          {!sessionStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 backdrop-blur-md bg-black/20"
            >
              <div className="max-w-4xl mx-auto flex items-center justify-between text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Time-aware guidance adapts to your day</span>
                </div>
                <div>
                  Current time: {sessionConfig.timePeriod}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Mood Tracker Modal */}
        <AnimatePresence>
          {showMoodTracker && (
            <MoodTracker
              title="How calm do you feel right now?"
              onMoodSelect={handleMoodSelected}
              onClose={() => setShowMoodTracker(false)}
            />
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <SessionHistory onClose={() => setShowHistory(false)} />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
