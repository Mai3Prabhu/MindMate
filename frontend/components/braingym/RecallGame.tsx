'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Check, X } from 'lucide-react'

interface RecallGameProps {
  onGameComplete: (score: number) => void
}

export default function RecallGame({ onGameComplete }: RecallGameProps) {
  const [sequence, setSequence] = useState<string>('')
  const [userInput, setUserInput] = useState('')
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [showSequence, setShowSequence] = useState(true)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [timeLeft, setTimeLeft] = useState(3)

  useEffect(() => {
    generateSequence()
  }, [level])

  useEffect(() => {
    if (showSequence && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (showSequence && timeLeft === 0) {
      setShowSequence(false)
      setTimeLeft(3)
    }
  }, [showSequence, timeLeft])

  const generateSequence = () => {
    const length = 3 + level
    const chars = '0123456789'
    let seq = ''
    for (let i = 0; i < length; i++) {
      seq += chars[Math.floor(Math.random() * chars.length)]
    }
    setSequence(seq)
    setShowSequence(true)
    setUserInput('')
    setResult(null)
    setTimeLeft(3)
  }

  const handleSubmit = () => {
    if (userInput === sequence) {
      setResult('correct')
      const points = level * 100
      setScore(score + points)
      
      setTimeout(() => {
        if (level >= 5) {
          onGameComplete(score + points)
        } else {
          setLevel(level + 1)
        }
      }, 1500)
    } else {
      setResult('wrong')
      setTimeout(() => {
        onGameComplete(score)
      }, 1500)
    }
  }

  const handleReset = () => {
    setLevel(1)
    setScore(0)
    generateSequence()
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <div>
            <div className="text-2xl font-bold">Level {level}</div>
            <div className="text-xs text-gray-500">Current Level</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs text-gray-500">Score</div>
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

      {/* Game Area */}
      <div className="card p-8">
        {showSequence ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-4">Memorize this sequence:</p>
            <div className="text-6xl font-mono font-bold mb-4 tracking-wider">
              {sequence}
            </div>
            <div className="text-2xl font-bold text-brand">
              {timeLeft}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-4">Type the sequence:</p>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
              maxLength={sequence.length}
              className="text-4xl font-mono font-bold text-center w-full max-w-md mx-auto mb-6 px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              placeholder="..."
              autoFocus
            />
            
            <button
              onClick={handleSubmit}
              disabled={userInput.length !== sequence.length}
              className="px-8 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-2 ${
              result === 'correct'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            {result === 'correct' ? (
              <>
                <Check className="w-5 h-5" />
                <span className="font-medium">Correct! +{level * 100} points</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                <span className="font-medium">Game Over! Final Score: {score}</span>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
