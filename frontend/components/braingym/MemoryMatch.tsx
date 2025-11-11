'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'

interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryMatchProps {
  onGameComplete: (score: number) => void
}

const symbols = ['🌟', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹']

export default function MemoryMatch({ onGameComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const gameSymbols = [...symbols, ...symbols]
    const shuffled = gameSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))
    
    setCards(shuffled)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setGameStarted(true)
  }

  const handleCardClick = (cardId: number) => {
    if (isChecking || flippedCards.length >= 2) return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)
    
    setCards(cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      checkMatch(newFlipped)
    }
  }

  const checkMatch = (flipped: number[]) => {
    setIsChecking(true)
    
    const [first, second] = flipped
    const firstCard = cards.find(c => c.id === first)
    const secondCard = cards.find(c => c.id === second)

    setTimeout(() => {
      if (firstCard?.symbol === secondCard?.symbol) {
        // Match found
        setCards(cards.map(c =>
          c.id === first || c.id === second
            ? { ...c, isMatched: true }
            : c
        ))
        setMatches(matches + 1)
        
        // Check if game complete
        if (matches + 1 === symbols.length) {
          const score = Math.max(0, 1000 - (moves * 10))
          setTimeout(() => onGameComplete(score), 500)
        }
      } else {
        // No match - flip back
        setCards(cards.map(c =>
          c.id === first || c.id === second
            ? { ...c, isFlipped: false }
            : c
        ))
      }
      
      setFlippedCards([])
      setIsChecking(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <div>
            <div className="text-2xl font-bold">{moves}</div>
            <div className="text-xs text-gray-500">Moves</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{matches}/{symbols.length}</div>
            <div className="text-xs text-gray-500">Matches</div>
          </div>
        </div>
        
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-gray-100 dark:bg-dark-deep rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || isChecking}
            className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all ${
              card.isMatched
                ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                : card.isFlipped
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-card'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.symbol : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
