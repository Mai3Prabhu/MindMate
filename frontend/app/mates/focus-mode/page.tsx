'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trees, Play, Pause, Square, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import ForestVisualizer from '@/components/focus/ForestVisualizer'

type TimeOfDay = 'morning' | 'day' | 'evening'
type TreeStage = 'sprout' | 'sapling' | 'tree'

export default function FocusModePage() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(60) // minutes
  const [timeRemaining, setTimeRemaining] = useState(duration * 60) // seconds
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [streak, setStreak] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate progress and tree stage
  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100
  const elapsedMinutes = (duration * 60 - timeRemaining) / 60

  const getTreeStage = (): TreeStage => {
    if (elapsedMinutes < 15) return 'sprout'
    if (elapsedMinutes < 30) return 'sapling'
    return 'tree'
  }

  const getTimeOfDay = (): TimeOfDay => {
    if (duration <= 60) return 'morning'
    if (duration <= 120) return 'day'
    return 'evening'
  }

  const [sessionId, setSessionId] = useState<string | null>(null)

  // Load streak from backend
  useEffect(() => {
    loadStreak()
  }, [])

  const loadStreak = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/focus/streak`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setStreak(data.current_streak || 0)
      }
    } catch (error) {
      console.error('Error loading streak:', error)
    }
  }

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, isPaused, timeRemaining])

  // Audio control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
      if (isActive && !isPaused) {
        audioRef.current.play().catch(err => console.error('Audio play error:', err))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isActive, isPaused, volume, isMuted])

  const handleStart = async () => {
    try {
      // Create session in backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/focus/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          duration_minutes: duration,
          environment: getTimeOfDay(),
          tree_stage: 'sprout'
        })
      })
      
      if (response.ok) {
        const session = await response.json()
        setSessionId(session.id)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
    
    setIsActive(true)
    setIsPaused(false)
    setTimeRemaining(duration * 60)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    setIsActive(false)
    setIsPaused(false)
    setTimeRemaining(duration * 60)
    if (audioRef.current) audioRef.current.pause()
  }

  const handleComplete = async () => {
    setIsActive(false)
    setShowCompletion(true)
    
    // Complete session in backend
    if (sessionId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/focus/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            completed: true,
            tree_stage: getTreeStage(),
            after_focus_level: 8 // Default high focus level for completion
          })
        })
        
        // Reload streak from backend
        await loadStreak()
      } catch (error) {
        console.error('Error completing session:', error)
      }
    }
    
    // Play completion chime
    const chime = new Audio('/focus-audio/chime.mp3')
    chime.volume = volume
    chime.play().catch(err => console.error('Chime error:', err))
  }

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration)
    if (!isActive) {
      setTimeRemaining(newDuration * 60)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCompletionMessage = () => {
    const hours = Math.floor(duration / 60)
    const mins = duration % 60
    const timeStr = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : `${mins} minutes`
    return `You stayed focused for ${timeStr} — your forest grew beautifully 🌿`
  }

  return (
    <AppLayout>
      <div className="fixed inset-0 flex flex-col -m-6">
        {/* Background Environment */}
        <div className="absolute inset-0 -z-10">
          <img
            src={`/focus-environments/forest/forest-${getTimeOfDay()}.jpg`}
            alt="Forest environment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Top Bar */}
        <div className="relative z-20 p-6 flex items-center justify-between backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-3">
            <Trees className="w-8 h-8 text-white drop-shadow-lg" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-white drop-shadow-lg">
                Focus Mode
              </h1>
              <p className="text-sm text-white/90 drop-shadow">
                🌿 Focus Streak: {streak} {streak === 1 ? 'Day' : 'Days'}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Exit
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          {!isActive ? (
            /* Setup Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  Set Your Focus Duration
                </h2>

                {/* Duration Slider */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Duration</span>
                    <span className="text-white text-2xl font-bold">{duration} min</span>
                  </div>
                  
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={duration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(202, 189, 255, 0.8) 0%, rgba(202, 189, 255, 0.8) ${(duration / 180) * 100}%, rgba(255,255,255,0.2) ${(duration / 180) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between mt-2 text-xs text-white/70">
                    <span>15 min 🌱</span>
                    <span>1 hr 🌿</span>
                    <span>2 hrs 🌳</span>
                    <span>3 hrs 🌲</span>
                  </div>
                </div>

                {/* Environment Preview */}
                <div className="mb-6 text-center">
                  <p className="text-white/80 text-sm mb-2">Environment</p>
                  <p className="text-white font-medium">
                    {getTimeOfDay() === 'morning' && '🌅 Morning Forest'}
                    {getTimeOfDay() === 'day' && '☀️ Daytime Forest'}
                    {getTimeOfDay() === 'evening' && '🌆 Evening Forest'}
                  </p>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStart}
                  className="w-full py-4 bg-gradient-to-r from-brand to-purple-500 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Focus Session
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Session */
            <div className="w-full max-w-4xl flex flex-col items-center">
              {/* Forest Visualizer */}
              <ForestVisualizer 
                stage={getTreeStage()} 
                progress={progress}
                isPaused={isPaused}
              />

              {/* Timer Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <div className="text-7xl font-bold text-white drop-shadow-2xl mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-white/80 text-lg">
                  {Math.floor(elapsedMinutes)} minutes focused
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Bottom Controls (only during active session) */}
        {isActive && (
          <div className="relative z-20 backdrop-blur-xl bg-black/30 border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand to-purple-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-8">
                {/* Left: Tree Stage */}
                <div className="flex items-center gap-3 min-w-[200px] text-white/90 text-sm">
                  <div>
                    {getTreeStage() === 'sprout' && '🌱 Sprout'}
                    {getTreeStage() === 'sapling' && '🌿 Sapling'}
                    {getTreeStage() === 'tree' && '🌳 Grown Tree'}
                  </div>
                </div>

                {/* Center: Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handlePause}
                    className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
                  >
                    {isPaused ? (
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    ) : (
                      <Pause className="w-6 h-6 text-white" />
                    )}
                  </button>

                  <button
                    onClick={handleStop}
                    className="px-4 py-3 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2 border border-red-400/30"
                  >
                    <Square className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">End</span>
                  </button>
                </div>

                {/* Right: Volume & Fullscreen */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value))
                      setIsMuted(false)
                    }}
                    className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                  />

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5 text-white" />
                    ) : (
                      <Maximize className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src="/focus-audio/forest-breeze.mp3"
          loop
          preload="auto"
        />

        {/* Completion Modal */}
        <AnimatePresence>
          {showCompletion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowCompletion(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">Session Complete!</h3>
                <p className="text-lg text-white/90 mb-6">
                  {getCompletionMessage()}
                </p>
                <p className="text-white/80 text-sm mb-6">
                  You nurtured your forest with presence — take a deep breath 🌳
                </p>
                <button
                  onClick={() => {
                    setShowCompletion(false)
                    setTimeRemaining(duration * 60)
                  }}
                  className="w-full py-3 bg-gradient-to-r from-brand to-purple-500 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
