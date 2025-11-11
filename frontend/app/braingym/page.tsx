'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Trophy, ArrowLeft } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import MemoryMatch from '@/components/braingym/MemoryMatch'
import RecallGame from '@/components/braingym/RecallGame'
import PatternGame from '@/components/braingym/PatternGame'
import ReactionTap from '@/components/braingym/ReactionTap'
import ProgressVisualization from '@/components/braingym/ProgressVisualization'

type GameType = 'memory_match' | 'recall' | 'pattern' | 'reaction' | null

interface Game {
  id: GameType
  name: string
  description: string
  icon: string
  color: string
}

const games: Game[] = [
  {
    id: 'memory_match',
    name: 'Memory Match',
    description: 'Match pairs of cards by remembering their positions',
    icon: '🎴',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'recall',
    name: 'Recall Game',
    description: 'Remember and retype sequences of numbers',
    icon: '🔢',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'pattern',
    name: 'Pattern Game',
    description: 'Repeat color and button sequences',
    icon: '🎨',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'reaction',
    name: 'Reaction Tap',
    description: 'Tap when the color changes',
    icon: '⚡',
    color: 'from-orange-500 to-red-500',
  },
]

export default function BrainGymPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null)
  const [showProgress, setShowProgress] = useState(false)

  const handleGameComplete = async (score: number) => {
    if (!selectedGame) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/braingym/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          game_type: selectedGame,
          score,
        }),
      })

      if (response.ok) {
        console.log('Score saved successfully')
        // Show progress after game
        setShowProgress(true)
      }
    } catch (error) {
      console.error('Error saving score:', error)
    }
  }

  const handleBackToMenu = () => {
    setSelectedGame(null)
    setShowProgress(false)
  }

  const renderGame = () => {
    switch (selectedGame) {
      case 'memory_match':
        return <MemoryMatch onGameComplete={handleGameComplete} />
      case 'recall':
        return <RecallGame onGameComplete={handleGameComplete} />
      case 'pattern':
        return <PatternGame onGameComplete={handleGameComplete} />
      case 'reaction':
        return <ReactionTap onGameComplete={handleGameComplete} />
      default:
        return null
    }
  }

  const currentGame = games.find((g) => g.id === selectedGame)

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedGame && (
              <button
                onClick={handleBackToMenu}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Brain className="w-8 h-8 text-brand" />
            <h1 className="text-3xl font-heading font-bold">
              {selectedGame ? currentGame?.name : 'Brain Gym'}
            </h1>
          </div>

          {selectedGame && !showProgress && (
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Progress
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            /* Game Selection Menu */
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Challenge your mind with cognitive games designed to improve memory, focus, and reaction time.
                  Track your progress and see AI-powered insights about your cognitive performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game, index) => (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedGame(game.id)}
                    className="card p-6 text-left hover:shadow-lg transition-all group"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                      {game.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {game.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Game View */
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {showProgress ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Progress</h2>
                    <button
                      onClick={() => setShowProgress(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-dark-deep rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
                    >
                      Back to Game
                    </button>
                  </div>
                  <ProgressVisualization
                    gameType={selectedGame}
                    gameName={currentGame?.name || ''}
                  />
                </div>
              ) : (
                <div className="card p-8">
                  {renderGame()}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  )
}
