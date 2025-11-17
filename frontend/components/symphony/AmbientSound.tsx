'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface AmbientSoundProps {
  intensity: number
  dominantEmotion: string | null
}

const emotionSounds: Record<string, string> = {
  joy: '/symphony-audio/joy.mp3',
  calm: '/symphony-audio/calm.mp3',
  peaceful: '/symphony-audio/peaceful.mp3',
  sadness: '/symphony-audio/rain.mp3',
  anxious: '/symphony-audio/tension.mp3',
  excited: '/symphony-audio/energy.mp3',
  default: '/symphony-audio/ambient.mp3'
}

export default function AmbientSound({ intensity, dominantEmotion }: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Select audio based on dominant emotion
    const soundFile = emotionSounds[dominantEmotion || 'default'] || emotionSounds.default
    
    if (audio.src !== soundFile) {
      audio.src = soundFile
      audio.load()
    }

    // Adjust volume based on intensity
    const targetVolume = isMuted ? 0 : Math.min(volume * (0.5 + intensity * 0.5), 1)
    audio.volume = targetVolume

    // Auto-play if there's significant activity
    if (intensity > 0.3 && !isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.log('Audio autoplay prevented:', err)
      })
    }
  }, [intensity, dominantEmotion, volume, isMuted, isPlaying])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.error('Audio play error:', err)
      })
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-card rounded-full shadow-lg border border-gray-200 dark:border-dark-border">
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onError={(e) => console.error('Audio error:', e)}
      />
      
      <button
        onClick={togglePlay}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-full transition-colors"
        title={isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
      >
        {isPlaying ? (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1 h-4 bg-brand rounded-full mr-1 animate-pulse" />
            <div className="w-1 h-4 bg-brand rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        ) : (
          <div className="w-4 h-4 border-l-4 border-l-brand border-y-2 border-y-transparent border-r-0 ml-1" />
        )}
      </button>

      <button
        onClick={toggleMute}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-full transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-gray-500" />
        ) : (
          <Volume2 className="w-4 h-4 text-brand" />
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
        className="w-16 h-1 bg-gray-200 dark:bg-dark-border rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgb(202, 189, 255) 0%, rgb(202, 189, 255) ${volume * 100}%, rgb(229, 231, 235) ${volume * 100}%, rgb(229, 231, 235) 100%)`
        }}
        title="Volume"
      />

      <div className="text-xs text-gray-500 min-w-[60px]">
        {dominantEmotion ? (
          <span className="capitalize">{dominantEmotion}</span>
        ) : (
          'Ambient'
        )}
      </div>
    </div>
  )
}