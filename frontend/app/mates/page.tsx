'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mic, MessageSquare, Music, Headphones, Trees, Heart } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import CardFeature from '@/components/CardFeature'
import WellnessPlanModal from '@/components/wellness/WellnessPlanModal'

const matesFeatures = [
  {
    title: 'Therapy',
    description: 'AI-powered compassionate support with conversation memory',
    icon: MessageCircle,
    href: '/mates/therapy',
    gradient: 'lavender' as const,
  },
  {
    title: 'FeelHear',
    description: 'Voice emotion analysis using AI to understand your feelings',
    icon: Mic,
    href: '/mates/feelhear',
    gradient: 'ocean' as const,
  },
  {
    title: 'FeelFlow',
    description: 'Track and understand your emotional patterns over time',
    icon: MessageSquare,
    href: '/mates/feelflow',
    gradient: 'sunset' as const,
  },
  {
    title: 'Symphony',
    description: 'Global emotional map and community support',
    icon: Music,
    href: '/mates/symphony',
    gradient: 'lavender' as const,
  },
  {
    title: 'Meditation Zone',
    description: 'Immersive meditation with time-aware guidance and visuals',
    icon: Headphones,
    href: '/mates/meditation',
    gradient: 'ocean' as const,
  },
  {
    title: 'Focus Mode',
    description: 'Grow your forest while staying focused and present',
    icon: Trees,
    href: '/mates/focus-mode',
    gradient: 'sunset' as const,
  },
]

export default function MatesPage() {
  const [showWellnessPlan, setShowWellnessPlan] = useState(false)

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Your Mates 🤝
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a companion to support your wellness journey
          </p>
        </div>

        {/* Wellness Plan Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowWellnessPlan(true)}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-8 text-white hover:scale-[1.02] transition-transform"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">Your Wellness Plan</h2>
                </div>
                <p className="text-white/90 text-lg">
                  Personalized tools for mindful breathing, movement, meditation, and reflection
                </p>
              </div>
              <div className="text-6xl opacity-80 group-hover:opacity-100 transition-opacity">
                ✨
              </div>
            </div>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matesFeatures.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CardFeature
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                gradient={feature.gradient}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-brand/5 to-purple-500/5 rounded-2xl border-2 border-brand/20"
        >
          <h2 className="text-xl font-semibold mb-2">About Mates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Each Mate is designed to support different aspects of your mental wellness journey. 
            Whether you need someone to talk to, want to track your emotions, or seek moments of calm, 
            your Mates are here to help you thrive.
          </p>
        </motion.div>

        {/* Wellness Plan Modal */}
        <WellnessPlanModal
          isOpen={showWellnessPlan}
          onClose={() => setShowWellnessPlan(false)}
        />
      </motion.div>
    </AppLayout>
  )
}
