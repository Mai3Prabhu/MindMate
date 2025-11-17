'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Square, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { wellnessAPI } from '@/lib/api'

interface MindfulBreathsModalProps {
  isOpen: boolean
  onClose: () => void
}

type BreathingPattern = 'box' | 'relax' | 'custom'
type BoxBreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle'

const breathingPatterns = [
  { id: 'box' as const, name: 'Box Breathing', description: '4-4-4-4 for calm focus' },
  { id: 'relax' as const, name: 'Relax Breathing', description: '4-7-8 for deep relaxation' },
  { id: 'custom' as const, name: 'Custom Breathing', description: 'Create your own pattern' },
]

const ambientSounds = [
  { id: 'ocean', name: 'Ocean Waves', file: '/ambient/ocean.mp3' },
  { id: 'wind', name: 'Gentle Wind', file: '/ambient/wind.mp3' },
  { id: 'hum', name: 'Soft Hum', file: '/ambient/hum.mp3' },
  { id: 'forest', name: 'Forest Ambience', file: '/ambient/forest.mp3' },
]

export default function MindfulBreathsModal({ isOpen, onClose }: MindfulBreathsModalProps) {
  // Pattern selection
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>('box')
  
  // Box breathing state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [phase, setPhase] = useState<BoxBreathingPhase>('idle')
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(4)
  const [duration, setDuration] = useState(3) // minutes
  const [totalTime, setTotalTime] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  
  // Audio and settings
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [selectedSound, setSelectedSound] = useState(ambientSounds[0])
  const [repeatEnabled, setRepeatEnabled] = useState(true)
  
  // Session tracking
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Box breathing cycle management
  useEffect(() => {
    if (!isPlaying || isPaused || selectedPattern !== 'box') return

    const runBoxBreathingCycle = () => {
      const phases: BoxBreathingPhase[] = ['inhale', 'hold1', 'exhale', 'hold2']
      let currentPhaseIndex = 0
      let phaseTime = 0

      const updatePhase = () => {
        const currentPhase = phases[currentPhaseIndex]
        setPhase(currentPhase)
        setPhaseTimeRemaining(4 - phaseTime)

        phaseTime++

        if (phaseTime >= 4) {
          phaseTime = 0
          currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
          
          // Complete cycle when back to inhale
          if (currentPhaseIndex === 0) {
            setCycleCount(prev => prev + 1)
          }
        }
      }

      // Start with inhale
      updatePhase()
      
      phaseTimerRef.current = setInterval(updatePhase, 1000)
    }

    runBoxBreathingCycle()

    return () => {
      if (phaseTimerRef.current) {
        clearInterval(phaseTimerRef.current)
      }
    }
  }, [isPlaying, isPaused, selectedPattern])

  // Session timer
  useEffect(() => {
    if (!isPlaying || isPaused) return

    timerRef.current = setInterval(() => {
      setTotalTime(prev => {
        const newTime = prev + 1
        
        // Check if session duration is complete
        if (newTime >= duration * 60) {
          handleStop(true) // true = completed
          return newTime
        }
        
        return newTime
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, isPaused, duration])

  // Audio management
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3
      if (soundEnabled && isPlaying && !isPaused) {
        audioRef.current.play().catch(console.error)
      } else {
        audioRef.current.pause()
      }
    }
  }, [soundEnabled, isPlaying, isPaused])

  const handleStart = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
    setIsPlaying(true)
    setIsPaused(false)
    setPhase('inhale')
  }

  const handlePause = () => {
    setIsPaused(true)
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current)
    }
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleStop = async (completed = false) => {
    setIsPlaying(false)
    setIsPaused(false)
    setPhase('idle')
    
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current)
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Save session if completed and has meaningful duration
    if (completed && totalTime >= 30 && sessionStartTime) { // At least 30 seconds
      try {
        await wellnessAPI.logBreathingSession({
          type: 'box_breathing',
          duration_minutes: Math.floor(totalTime / 60),
          cycles_completed: cycleCount,
          timestamp: sessionStartTime.toISOString()
        })
        setSessionCompleted(true)
        
        // Show completion for 2 seconds then reset
        setTimeout(() => {
          handleReset()
        }, 2000)
      } catch (error) {
        console.error('Error saving breathing session:', error)
      }
    } else {
      handleReset()
    }
  }

  const handleReset = () => {
    setTotalTime(0)
    setPhaseTimeRemaining(4)
    setCycleCount(0)
    setSessionStartTime(null)
    setSessionCompleted(false)
  }

  const getBreathBallScale = () => {
    if (phase === 'idle') return 1
    if (phase === 'inhale') return 1.4
    if (phase === 'hold1' || phase === 'hold2') return phase === 'hold1' ? 1.4 : 1
    if (phase === 'exhale') return 1
    return 1
  }

  const getBreathBallGradient = () => {
    return 'from-purple-400 via-purple-500 to-indigo-600'
  }

  const getPhaseText = () => {
    if (phase === 'idle') return 'Ready to begin'
    if (phase === 'inhale') return 'Breathe In...'
    if (phase === 'hold1') return 'Hold...'
    if (phase === 'exhale') return 'Breathe Out...'
    if (phase === 'hold2') return 'Hold...'
    return ''
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAnimationDuration = () => {
    if (phase === 'inhale' || phase === 'exhale') return 4
    return 0.5 // For holds, quick transition
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 md:inset-10 bg-gradient-to-br from-purple-50/95 via-white/95 to-indigo-50/95 dark:from-dark-card/95 dark:via-dark-bg/95 dark:to-purple-900/20 backdrop-blur-xl rounded-3xl shadow-2xl z-[60] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Mindful Breaths</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {breathingPatterns.find(p => p.id === selectedPattern)?.name} • {duration} min
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-deep transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-88px)] overflow-y-auto">
              {/* Pattern Tabs */}
              <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-6 pb-4">
                <div className="flex gap-2">
                  {breathingPatterns.map((pattern) => (
                    <button
                      key={pattern.id}
                      onClick={() => {
                        setSelectedPattern(pattern.id)
                        handleReset()
                      }}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedPattern === pattern.id
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:border-purple-500/50'
                      }`}
                    >
                      {pattern.name}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {breathingPatterns.find(p => p.id === selectedPattern)?.description}
                </p>
              </div>

              {selectedPattern === 'box' ? (
                /* Box Breathing Interface */
                <div className="p-6 flex flex-col items-center justify-center min-h-[500px]">
                  {sessionCompleted ? (
                    /* Completion Screen */
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Great job! You completed {cycleCount} breathing cycles.
                      </p>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Session saved to your wellness history
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Breath Ball Animation */}
                      <div className="relative mb-8">
                        <motion.div
                          animate={{
                            scale: getBreathBallScale(),
                          }}
                          transition={{
                            duration: getAnimationDuration(),
                            ease: 'easeInOut'
                          }}
                          className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${getBreathBallGradient()} shadow-2xl`}
                        >
                          {/* Glow Effect */}
                          <motion.div
                            animate={{
                              opacity: (phase === 'hold1' || phase === 'hold2') ? [0.4, 0.8, 0.4] : 0.3,
                              scale: (phase === 'hold1' || phase === 'hold2') ? [1, 1.1, 1] : 1,
                            }}
                            transition={{
                              duration: 2,
                              repeat: (phase === 'hold1' || phase === 'hold2') ? Infinity : 0,
                            }}
                            className="absolute inset-0 rounded-full bg-purple-400 blur-3xl"
                          />
                          
                          {/* Inner Circle */}
                          <div className="absolute inset-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-6xl font-bold">{phaseTimeRemaining}</div>
                              <div className="text-sm opacity-80">seconds</div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Idle Pulse */}
                        {phase === 'idle' && (
                          <motion.div
                            animate={{
                              scale: [1, 1.05, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getBreathBallGradient()}`}
                          />
                        )}
                      </div>

                      {/* Phase Text */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={phase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-3xl font-bold text-center mb-6 text-purple-700 dark:text-purple-300"
                        >
                          {getPhaseText()}
                        </motion.div>
                      </AnimatePresence>

                      {/* Timer and Stats */}
                      <div className="text-center mb-8 space-y-2">
                        <div className="text-lg text-gray-600 dark:text-gray-400">
                          {formatTime(totalTime)} / {formatTime(duration * 60)}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          Cycles completed: {cycleCount}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-4 mb-6">
                        {!isPlaying ? (
                          <button
                            onClick={handleStart}
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                          >
                            <Play className="w-5 h-5" />
                            Start
                          </button>
                        ) : isPaused ? (
                          <button
                            onClick={handleResume}
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                          >
                            <Play className="w-5 h-5" />
                            Resume
                          </button>
                        ) : (
                          <button
                            onClick={handlePause}
                            className="px-8 py-4 bg-gray-200 dark:bg-dark-card rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <Pause className="w-5 h-5" />
                            Pause
                          </button>
                        )}
                        
                        {(isPlaying || isPaused || totalTime > 0) && (
                          <button
                            onClick={() => handleStop(false)}
                            className="px-8 py-4 bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <Square className="w-5 h-5" />
                            Stop
                          </button>
                        )}
                        
                        <button
                          onClick={handleReset}
                          className="px-6 py-4 bg-gray-100 dark:bg-dark-deep rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      </div>

                      {/* Settings */}
                      <div className="w-full max-w-md space-y-4">
                        {/* Duration Selection */}
                        <div>
                          <h4 className="font-semibold mb-2 text-center">Duration</h4>
                          <div className="flex gap-2">
                            {[1, 3, 5].map((min) => (
                              <button
                                key={min}
                                onClick={() => setDuration(min)}
                                disabled={isPlaying}
                                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                                  duration === min
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700'
                                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {min} min
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Audio Controls */}
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-3 rounded-lg transition-all ${
                              soundEnabled 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                          </button>
                          
                          <button
                            onClick={() => setRepeatEnabled(!repeatEnabled)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${
                              repeatEnabled 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <RotateCcw className="w-4 h-4 inline mr-2" />
                            Repeat
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Other Patterns - Placeholder */
                <div className="p-6 flex items-center justify-center min-h-[500px]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPattern === 'relax' ? 'Relax Breathing' : 'Custom Breathing'} pattern is under development.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Element */}
            {soundEnabled && (
              <audio
                ref={audioRef}
                src={selectedSound.file}
                loop
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
