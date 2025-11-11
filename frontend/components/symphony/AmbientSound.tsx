'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface AmbientSoundProps {
  intensity: number
  dominantEmotion: string | null
}

export default function AmbientSound({ intensity, dominantEmotion }: AmbientSoundProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      stopSound()
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !isMuted) {
      updateSound()
    }
  }, [intensity, dominantEmotion, isPlaying, isMuted])

  const startSound = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current

    // Resume audio context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Create gain node for volume control
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)
    gainNode.gain.value = 0.1 * intensity // Volume based on intensity
    gainNodeRef.current = gainNode

    // Create oscillators based on emotion
    const frequencies = getEmotionFrequencies(dominantEmotion)
    
    frequencies.forEach((freq) => {
      const oscillator = ctx.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = freq
      
      // Add subtle vibrato
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.5
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 2
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)
      lfo.start()
      
      oscillator.connect(gainNode)
      oscillator.start()
      oscillatorsRef.current.push(oscillator)
    })

    setIsPlaying(true)
  }

  const stopSound = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {
        // Oscillator already stopped
      }
    })
    oscillatorsRef.current = []
    
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    
    setIsPlaying(false)
  }

  const updateSound = () => {
    if (!gainNodeRef.current || !audioContextRef.current) return

    // Update volume based on intensity
    gainNodeRef.current.gain.setTargetAtTime(
      0.1 * intensity,
      audioContextRef.current.currentTime,
      0.5
    )

    // Update frequencies if emotion changed
    const newFrequencies = getEmotionFrequencies(dominantEmotion)
    oscillatorsRef.current.forEach((osc, index) => {
      if (newFrequencies[index]) {
        osc.frequency.setTargetAtTime(
          newFrequencies[index],
          audioContextRef.current!.currentTime,
          1
        )
      }
    })
  }

  const toggleSound = () => {
    if (isMuted) {
      setIsMuted(false)
      startSound()
    } else {
      setIsMuted(true)
      stopSound()
    }
  }

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-6 right-6 p-4 bg-brand text-white rounded-full shadow-lg hover:bg-brand-deep transition-colors z-50"
      title={isMuted ? 'Enable ambient sound' : 'Disable ambient sound'}
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6" />
      ) : (
        <Volume2 className="w-6 h-6" />
      )}
    </button>
  )
}

function getEmotionFrequencies(emotion: string | null): number[] {
  // Map emotions to harmonic frequencies (Hz)
  // Using pentatonic and ambient scales for pleasant sounds
  
  const frequencyMaps: Record<string, number[]> = {
    happy: [261.63, 329.63, 392.00, 523.25],      // C major chord
    joyful: [261.63, 329.63, 392.00, 523.25],
    excited: [293.66, 369.99, 440.00, 587.33],    // D major chord
    calm: [220.00, 277.18, 329.63, 440.00],       // A minor chord
    peaceful: [220.00, 277.18, 329.63, 440.00],
    relaxed: [196.00, 246.94, 293.66, 392.00],    // G major chord
    sad: [220.00, 261.63, 329.63, 440.00],        // A minor
    anxious: [233.08, 293.66, 349.23, 466.16],    // Bb major
    stressed: [246.94, 311.13, 369.99, 493.88],   // B major
    grateful: [261.63, 329.63, 392.00, 523.25],   // C major
    hopeful: [293.66, 369.99, 440.00, 587.33],    // D major
    focused: [196.00, 246.94, 293.66, 392.00],    // G major
    neutral: [220.00, 277.18, 329.63, 440.00],    // A minor
  }

  return frequencyMaps[emotion?.toLowerCase() || 'neutral'] || frequencyMaps.neutral
}
