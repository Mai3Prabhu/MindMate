'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Play } from 'lucide-react'

interface PatternGameProps {
  onGameComplete: (score: number) => void
}

const colors = [
  { id: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600', active: 'bg-red-700' },
  { id: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', active: 'bg-blue-700' },
  { id: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600', active: 'bg-green-700' },
  { id: 'yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', active: 'bg-yellow-700' },
]

export default function PatternGame({ onGameComplete }: PatternGameProps) {
  const [sequence, setSequence] = useState<string[]>([])
  const [userSequence, setUserSequence] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUserTurn, setIsUserTurn] = useState(false)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const startGame = () => {
    setSequence([])
    setUserSequence([])
    setLevel(1)
    setScore(0)
    setGameOver(false)
    addToSequence([])
  }

  const addToSequence = (currentSequence: string[]) => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)].id
    const newSequence = [...currentSequence, randomColor]
    setSequence(newSequence)
    playSequence(newSequence)
  }

  const playSequence = async (seq: string[]) => {
    setIsPlaying(true)
    setIsUserTurn(false)
    setUserSequence([])

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setActiveColor(seq[i])
      await new Promise(resolve => setTimeout(resolve, 600))
      setActiveColor(null)
    }

    setIsPlaying(false)
    setIsUserTurn(true)
  }

  const handleColorClick = (colorId: string) => {
    if (!isUserTurn || isPlaying) return

    const newUserSequence = [...userSequence, colorId]
    setUserSequence(newUserSequence)

    // Flash the color
    setActiveColor(colorId)
    setTimeout(() => setActiveColor(null), 300)

    // Check if correct
    const currentIndex = newUserSequence.length - 1
    if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
      // Wrong!
      setGameOver(true)
      setIsUserTurn(false)
      setTimeout(() => onGameComplete(score), 1500)
      return
    }

    // Check if sequence complete
    if (newUserSequence.length === sequence.length) {
      // Correct sequence!
      const points = level * 100
      setScore(score + points)
      setLevel(level + 1)
      setIsUserTurn(false)

      setTimeout(() => {
        if (level >= 10) {
          // Max level reached
          onGameComplete(score + points)
        } else {
          addToSequence(sequence)
        }
      }, 1000)
    }
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
          onClick={startGame}
          className="px-4 py-2 bg-gray-100 dark:bg-dark-deep rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {sequence.length === 0 ? 'Start' : 'Reset'}
        </button>
      </div>

      {/* Game Status */}
      <div className="text-center">
        {sequence.length === 0 && (
          <p className="text-gray-500">Click Start to begin!</p>
        )}
        {isPlaying && (
          <p className="text-brand font-medium">Watch the pattern...</p>
        )}
        {isUserTurn && (
          <p className="text-green-600 dark:text-green-400 font-medium">Your turn! Repeat the pattern</p>
        )}
        {gameOver && (
          <p className="text-red-600 dark:text-red-400 font-medium">Game Over! Final Score: {score}</p>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {colors.map((color) => (
          <motion.button
            key={color.id}
            whileHover={{ scale: isUserTurn ? 1.05 : 1 }}
            whileTap={{ scale: isUserTurn ? 0.95 : 1 }}
            onClick={() => handleColorClick(color.id)}
            disabled={!isUserTurn || isPlaying}
            className={`aspect-square rounded-2xl transition-all ${
              activeColor === color.id
                ? color.active
                : color.bg
            } ${isUserTurn ? color.hover : ''} disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      {isUserTurn && (
        <div className="flex justify-center gap-2">
          {sequence.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index < userSequence.length
                  ? 'bg-brand'
                  : 'bg-gray-300 dark:bg-dark-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
