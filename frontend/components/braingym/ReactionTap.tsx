'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Zap } from 'lucide-react'

interface ReactionTapProps {
  onGameComplete: (score: number) => void
}

export default function ReactionTap({ onGameComplete }: ReactionTapProps) {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'clicked' | 'tooEarly'>('idle')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])
  const [round, setRound] = useState(0)
  const startTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const maxRounds = 5

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startRound = () => {
    if (round >= maxRounds) {
      return
    }

    setGameState('waiting')
    setReactionTime(null)

    // Random delay between 1-4 seconds
    const delay = 1000 + Math.random() * 3000
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }

  const handleTap = () => {
    if (gameState === 'waiting') {
      // Too early!
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setGameState('tooEarly')
      setTimeout(() => {
        setGameState('idle')
      }, 1500)
      return
    }

    if (gameState === 'ready') {
      // Calculate reaction time
      const endTime = Date.now()
      const reaction = endTime - startTimeRef.current
      setReactionTime(reaction)
      setGameState('clicked')

      const newAttempts = [...attempts, reaction]
      setAttempts(newAttempts)
      setRound(round + 1)

      setTimeout(() => {
        if (round + 1 >= maxRounds) {
          // Game complete
          const avgReaction = newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length
          const score = Math.max(0, Math.round(1000 - avgReaction))
          setTimeout(() => onGameComplete(score), 1000)
        } else {
          setGameState('idle')
        }
      }, 1500)
    }
  }

  const handleReset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setGameState('idle')
    setReactionTime(null)
    setAttempts([])
    setRound(0)
  }

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting':
        return 'bg-red-500'
      case 'ready':
        return 'bg-green-500'
      case 'tooEarly':
        return 'bg-orange-500'
      case 'clicked':
        return 'bg-blue-500'
      default:
        return 'bg-gray-200 dark:bg-dark-deep'
    }
  }

  const getMessage = () => {
    switch (gameState) {
      case 'idle':
        return round === 0 ? 'Click to start!' : 'Click for next round'
      case 'waiting':
        return 'Wait for green...'
      case 'ready':
        return 'TAP NOW!'
      case 'tooEarly':
        return 'Too early! Wait for green'
      case 'clicked':
        return `${reactionTime}ms`
      default:
        return ''
    }
  }

  const averageReaction = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <div>
            <div className="text-2xl font-bold">{round}/{maxRounds}</div>
            <div className="text-xs text-gray-500">Round</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{averageReaction}ms</div>
            <div className="text-xs text-gray-500">Avg Time</div>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 dark:bg-dark-deep rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="card p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <Zap className="w-5 h-5 mx-auto mb-2 text-brand" />
        <p>Wait for the screen to turn green, then tap as fast as you can!</p>
      </div>

      {/* Game Area */}
      <motion.button
        onClick={gameState === 'idle' ? startRound : handleTap}
        disabled={round >= maxRounds && gameState !== 'idle'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full h-96 rounded-2xl transition-all duration-300 flex items-center justify-center ${getBackgroundColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {getMessage()}
          </div>
          {gameState === 'clicked' && reactionTime && (
            <div className="text-lg text-white/80">
              {reactionTime < 200 ? '⚡ Lightning fast!' :
               reactionTime < 300 ? '🎯 Great reaction!' :
               reactionTime < 400 ? '👍 Good job!' :
               '💪 Keep practicing!'}
            </div>
          )}
        </div>
      </motion.button>

      {/* Attempts History */}
      {attempts.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-3">Reaction Times</h3>
          <div className="flex gap-2 flex-wrap">
            {attempts.map((time, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-dark-deep rounded-lg text-sm"
              >
                {time}ms
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
