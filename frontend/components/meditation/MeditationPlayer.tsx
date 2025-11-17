'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react'
import MoodTracker from './MoodTracker'

interface MeditationPlayerProps {
  config: {
    theme: string
    voiceType: string
    duration: number
    timePeriod: string
  }
  onSessionEnd: (afterMood: number) => void
  closingMessage: string
}

export default function MeditationPlayer({ config, onSessionEnd, closingMessage }: MeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEndMoodTracker, setShowEndMoodTracker] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const totalDuration = config.duration * 60 // Convert to seconds

  useEffect(() => {
    // Auto-play when component mounts
    handlePlay()
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.playbackRate = 0.75 // Slower, more calming speed
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (currentTime >= totalDuration && isPlaying) {
      handleSessionComplete()
    }
  }, [currentTime, totalDuration, isPlaying])

  const handlePlay = () => {
    setIsPlaying(true)
    
    if (audioRef.current && config.voiceType !== 'silent') {
      audioRef.current.play().catch(err => {
        console.error('Audio play error:', err)
      })
    }

    timerRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1)
    }, 1000)
  }

  const handlePause = () => {
    setIsPlaying(false)
    
    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const handleStop = () => {
    handlePause()
    setShowEndMoodTracker(true)
  }

  const handleSessionComplete = () => {
    handlePause()
    setSessionEnded(true)
    setTimeout(() => {
      setShowEndMoodTracker(true)
    }, 2000)
  }

  const handleEndMoodSelect = (mood: number) => {
    onSessionEnd(mood)
  }

  const handleExit = () => {
    // End session early - same as stop button
    handleStop()
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
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / totalDuration) * 100

  // Audio file path
  const audioPath = config.voiceType !== 'silent' 
    ? `/meditation-audios/${config.voiceType}/${config.timePeriod}.mp3`
    : null

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Fullscreen Background Video/Image */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={`/meditation-scenes/${config.theme}/bg.jpg`}
        >
          <source src={`/meditation-scenes/${config.theme}/${config.theme}.mp4`} type="video/mp4" />
        </video>
        <img
          src={`/meditation-scenes/${config.theme}/bg.jpg`}
          alt={config.theme}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Center Content - Breathing Circle */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* Breathing Circle Animation */}
          <motion.div
            animate={{
              scale: isPlaying ? [1, 1.2, 1] : 1,
              opacity: isPlaying ? [0.6, 1, 0.6] : 0.6,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-white/30 to-brand/30 backdrop-blur-lg flex items-center justify-center mb-6"
          >
            <motion.div
              animate={{
                scale: isPlaying ? [1, 0.8, 1] : 1,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-28 h-28 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center"
            >
              <span className="text-white text-sm font-medium drop-shadow-lg">
                {isPlaying ? 'Breathe' : 'Paused'}
              </span>
            </motion.div>
          </motion.div>

          {/* Time Display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2 drop-shadow-2xl">
              {formatTime(totalDuration - currentTime)}
            </div>
            <div className="text-white/70 text-base drop-shadow-lg">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
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
            {/* Left: Session Info */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="text-white/90 text-sm">
                <div className="font-medium">
                  {config.theme.charAt(0).toUpperCase() + config.theme.slice(1)}
                </div>
                <div className="text-white/60 text-xs">
                  {config.voiceType.charAt(0).toUpperCase() + config.voiceType.slice(1)} Voice
                </div>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Play"
                >
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Pause"
                >
                  <Pause className="w-6 h-6 text-white" />
                </button>
              )}

              <button
                onClick={handleStop}
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
                aria-label="Stop"
              >
                <Square className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handleExit}
                className="px-4 py-3 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2 border border-red-400/30"
                aria-label="End session"
              >
                <X className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">End Session</span>
              </button>
            </div>

            {/* Right: Volume & Fullscreen */}
            <div className="flex items-center gap-4 min-w-[200px] justify-end">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
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
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
                aria-label="Volume"
              />

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
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

      {/* Audio Element */}
      {audioPath && (
        <audio
          ref={audioRef}
          src={audioPath}
          preload="auto"
        />
      )}

      {/* Session Complete Message */}
      <AnimatePresence>
        {sessionEnded && !showEndMoodTracker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center backdrop-blur-xl bg-black/50 rounded-3xl"
          >
            <div className="text-center text-white p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Session Complete</h3>
              <p className="text-lg text-white/80">{closingMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Mood Tracker */}
      <AnimatePresence>
        {showEndMoodTracker && (
          <MoodTracker
            title="How calm do you feel now?"
            onMoodSelect={handleEndMoodSelect}
            onClose={() => setShowEndMoodTracker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
