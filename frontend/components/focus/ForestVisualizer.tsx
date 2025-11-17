'use client'

import { motion } from 'framer-motion'

interface ForestVisualizerProps {
  stage: 'sprout' | 'sapling' | 'tree'
  progress: number
  isPaused: boolean
}

export default function ForestVisualizer({ stage, progress, isPaused }: ForestVisualizerProps) {
  const getTreeScale = () => {
    if (stage === 'sprout') return 0.3
    if (stage === 'sapling') return 0.6
    return 1
  }

  const getTreeOpacity = () => {
    const baseOpacity = stage === 'sprout' ? 0.7 : stage === 'sapling' ? 0.85 : 1
    // Use progress to gradually increase opacity within each stage
    const progressBoost = (progress / 100) * 0.2
    return Math.min(baseOpacity + progressBoost, 1)
  }

  return (
    <div className="relative w-full max-w-md h-64 flex items-end justify-center">
      {/* Fireflies (only for completed tree) */}
      {stage === 'tree' && !isPaused && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                bottom: `${30 + Math.random() * 40}%`,
                boxShadow: '0 0 10px rgba(253, 224, 71, 0.8)',
              }}
            />
          ))}
        </>
      )}

      {/* Tree SVG */}
      <motion.div
        animate={{
          scale: getTreeScale(),
          opacity: getTreeOpacity(),
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <svg
          width="200"
          height="250"
          viewBox="0 0 200 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Trunk */}
          <motion.rect
            x="85"
            y="150"
            width="30"
            height="100"
            fill="#8B4513"
            rx="5"
            initial={{ height: 0 }}
            animate={{ height: stage === 'sprout' ? 40 : stage === 'sapling' ? 70 : 100 }}
            transition={{ duration: 1 }}
          />

          {/* Foliage - Sprout */}
          {stage === 'sprout' && (
            <motion.circle
              cx="100"
              cy="140"
              r="20"
              fill="#90EE90"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Foliage - Sapling */}
          {stage === 'sapling' && (
            <>
              <motion.circle
                cx="100"
                cy="120"
                r="35"
                fill="#228B22"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.circle
                cx="80"
                cy="135"
                r="25"
                fill="#32CD32"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <motion.circle
                cx="120"
                cy="135"
                r="25"
                fill="#32CD32"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </>
          )}

          {/* Foliage - Full Tree */}
          {stage === 'tree' && (
            <>
              {/* Main canopy */}
              <motion.circle
                cx="100"
                cy="100"
                r="50"
                fill="#228B22"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.circle
                cx="70"
                cy="120"
                r="40"
                fill="#2E8B57"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <motion.circle
                cx="130"
                cy="120"
                r="40"
                fill="#2E8B57"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <motion.circle
                cx="100"
                cy="80"
                r="35"
                fill="#3CB371"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              {/* Highlights */}
              <motion.circle
                cx="90"
                cy="95"
                r="15"
                fill="#90EE90"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              />
              <motion.circle
                cx="115"
                cy="110"
                r="12"
                fill="#90EE90"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              />
            </>
          )}
        </svg>

        {/* Gentle sway animation when not paused */}
        {!isPaused && (
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: [-1, 1, -1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Growth indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/80 text-sm font-medium backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full"
        >
          {stage === 'sprout' && '🌱 Growing...'}
          {stage === 'sapling' && '🌿 Flourishing...'}
          {stage === 'tree' && '🌳 Thriving!'}
        </motion.div>
      </div>
    </div>
  )
}
