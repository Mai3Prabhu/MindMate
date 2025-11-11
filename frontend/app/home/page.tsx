'use client'

import { motion } from 'framer-motion'
import { Brain, Heart, Sparkles } from 'lucide-react'
import AppLayout from '@/components/AppLayout'

export default function HomePage() {
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <Brain className="w-24 h-24 text-brand" strokeWidth={1.5} />
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-accent-yellow" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Welcome to <span className="text-brand">MindMate</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your compassionate companion for mental wellness
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Heart className="w-12 h-12 text-brand mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Emotional Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered therapy and mood tracking to support your emotional wellbeing
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Brain className="w-12 h-12 text-accent-teal mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cognitive Health</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Engaging games and exercises to keep your mind sharp and healthy
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Sparkles className="w-12 h-12 text-accent-yellow mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with a global community sharing their emotional journeys
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  )
}
