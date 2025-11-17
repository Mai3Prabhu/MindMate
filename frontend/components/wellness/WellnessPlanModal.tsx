'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


import { X, Wind, Activity, Sparkles, BookHeart, Target, Award } from 'lucide-react'
import MindfulBreathsModal from './MindfulBreathsModal'
import MoveFlowModal from './MoveFlowModal'
import PeaceHubModal from './PeaceHubModal'
import ReflectHealModal from './ReflectHealModal'
import GoalsStreaksPanel from './GoalsStreaksPanel'

interface WellnessPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

type ActiveModule = 'breaths' | 'move' | 'peace' | 'reflect' | 'goals' | null

export default function WellnessPlanModal({ isOpen, onClose }: WellnessPlanModalProps) {
  const [activeModule, setActiveModule] = useState<ActiveModule>(null)



  const modules = [
    {
      id: 'breaths' as const,
      title: 'Mindful Breaths',
      description: 'Guided breathing exercises',
      icon: Wind,
      gradient: 'from-cyan-400/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10'
    },
    {
      id: 'move' as const,
      title: 'Move & Flow',
      description: 'Physical wellness activities',
      icon: Activity,
      gradient: 'from-green-400/20 to-emerald-500/20',
      iconColor: 'text-green-400',
      bgGlow: 'bg-green-500/10'
    },
    {
      id: 'peace' as const,
      title: 'Peace Hub',
      description: 'Go to Meditation Zone →',
      icon: Sparkles,
      gradient: 'from-purple-400/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      bgGlow: 'bg-purple-500/10'
    },
    {
      id: 'reflect' as const,
      title: 'Reflect & Heal',
      description: 'Go to Digital Journal →',
      icon: BookHeart,
      gradient: 'from-orange-400/20 to-rose-500/20',
      iconColor: 'text-orange-400',
      bgGlow: 'bg-orange-500/10'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Main Modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[75%] bg-gradient-to-br from-purple-50/95 via-white/95 to-pink-50/95 dark:from-dark-bg/95 dark:via-dark-card/95 dark:to-purple-900/20 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-dark-card/50 backdrop-blur-md">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent">
                      Your Wellness Plan
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Personalized tools for your wellbeing journey
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-deep transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-88px)] overflow-y-auto p-6 space-y-6">
              {/* AI Daily Tip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand/10 via-purple-500/10 to-pink-500/10 border border-brand/20 p-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand mb-1">Today's Wellness Tip</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Start your day with 3 minutes of mindful breathing. It helps reduce stress and improves focus throughout the day.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Module Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module, index) => {
                  // For navigation modules, use Link component
                  if (module.id === 'peace' || module.id === 'reflect') {
                    const href = module.id === 'peace' ? '/mates/meditation' : '/journal'
                    
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => {
                            console.log(`Navigating to: ${href}`)
                            onClose()
                            // Force navigation with page reload to bypass any routing issues
                            window.location.href = href
                          }}
                          className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-brand/50 transition-all hover:scale-[1.02] p-6 text-left w-full"
                        >
                          {/* Glow Effect */}
                          <div className={`absolute inset-0 ${module.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                          
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          
                          <div className="relative">
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${module.gradient} mb-4`}>
                              <module.icon className={`w-6 h-6 ${module.iconColor}`} />
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {module.description}
                            </p>
                            
                            <div className="mt-4 flex items-center text-sm text-brand font-medium">
                              <span>
                                {module.id === 'peace' ? 'Go to Meditation' : 'Go to Journal'}
                              </span>
                              <motion.span
                                className="ml-2"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              >
                                →
                              </motion.span>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    )
                  }
                  
                  // For modal modules, use button
                  return (
                    <motion.button
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setActiveModule(module.id)}
                      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-brand/50 transition-all hover:scale-[1.02] p-6 text-left"
                    >
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 ${module.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                      
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className="relative">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${module.gradient} mb-4`}>
                          <module.icon className={`w-6 h-6 ${module.iconColor}`} />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {module.description}
                        </p>
                        
                        <div className="mt-4 flex items-center text-sm text-brand font-medium">
                          <span>Open module</span>
                          <motion.span
                            className="ml-2"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            →
                          </motion.span>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Goals & Streaks Panel */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setActiveModule('goals')}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:scale-[1.01] p-6 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Goals & Streaks</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Track your progress and earn badges
                      </p>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Module Modals - Only render if not navigating to external pages */}
          {activeModule === 'breaths' && (
            <MindfulBreathsModal
              isOpen={true}
              onClose={() => setActiveModule(null)}
            />
          )}
          {activeModule === 'move' && (
            <MoveFlowModal
              isOpen={true}
              onClose={() => setActiveModule(null)}
            />
          )}
          {activeModule === 'goals' && (
            <GoalsStreaksPanel
              isOpen={true}
              onClose={() => setActiveModule(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}
