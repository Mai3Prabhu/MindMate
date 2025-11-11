'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Pause, Loader2 } from 'lucide-react'

interface AudioRecorderProps {
  maxDuration?: number
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onCancel?: () => void
}

export default function AudioRecorder({
  maxDuration = 30,
  onRecordingComplete,
  onCancel
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>(new Array(50).fill(0))
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
      if (audioURL) URL.revokeObjectURL(audioURL)
    }
  }, [audioURL])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio context for waveform
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      // Start waveform animation
      updateWaveform()
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        
        stream.getTracks().forEach(track => track.stop())
        if (audioContextRef.current) audioContextRef.current.close()
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
          }
          return newDuration
        })
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const updateWaveform = () => {
    if (!analyserRef.current) return
    
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Sample data for waveform (take every nth value)
    const samples = 50
    const step = Math.floor(bufferLength / samples)
    const newWaveform = []
    
    for (let i = 0; i < samples; i++) {
      const value = dataArray[i * step] / 255
      newWaveform.push(value)
    }
    
    setWaveformData(newWaveform)
    
    animationFrameRef.current = requestAnimationFrame(updateWaveform)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const togglePlayback = () => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioURL)
      audioElementRef.current.onended = () => setIsPlaying(false)
    }
    
    if (isPlaying) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    } else {
      audioElementRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSubmit = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration)
    }
  }

  const handleCancel = () => {
    if (isRecording) {
      stopRecording()
    }
    setAudioBlob(null)
    setAudioURL('')
    setDuration(0)
    onCancel?.()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Waveform Visualization */}
      <div className="card p-8">
        <div className="flex items-end justify-center gap-1 h-32 mb-6">
          {waveformData.map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ 
                height: isRecording ? `${Math.max(value * 100, 4)}%` : '4px',
                backgroundColor: isRecording ? '#9D8AFF' : '#E5E7EB'
              }}
              transition={{ duration: 0.1 }}
              className="w-2 rounded-full"
              style={{ minHeight: '4px' }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold font-mono mb-2">
            {formatTime(duration)}
          </div>
          <div className="text-sm text-gray-500">
            {isRecording ? 'Recording...' : audioBlob ? 'Recording complete' : 'Ready to record'}
          </div>
          {isRecording && (
            <div className="text-xs text-gray-400 mt-1">
              Max duration: {maxDuration}s
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!audioBlob ? (
            <>
              {!isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-deep transition-colors"
                >
                  <Mic className="w-8 h-8" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <Square className="w-8 h-8" />
                </motion.button>
              )}
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayback}
                className="w-16 h-16 bg-gray-200 dark:bg-dark-deep text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-dark-card transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {audioBlob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep transition-colors"
          >
            Analyze Emotion
          </button>
        </motion.div>
      )}
    </div>
  )
}
