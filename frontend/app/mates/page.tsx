'use client'

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CardFeature from '@/components/CardFeature';
import { Sidebar, SidebarIcon } from '@/components/SidebarIcon';
import { 
  Library as LibraryIcon,
  Target as TargetIcon,
  HeartPulse as HeartPulseIcon,
  Stethoscope as StethoscopeIcon,
  BrainCircuit as BrainCircuitIcon,
  Bot as BotIcon,
  BookMarked as BookMarkedIcon,
  BarChart3 as BarChartIcon,
  MessageCircle as MessageCircleIcon,
  Headphones as HeadphonesIcon,
  BookOpen as BookOpenIcon
} from 'lucide-react';

// Sidebar features
const sidebarFeatures = [
  {
    title: 'Content Library',
    icon: <LibraryIcon className="w-5 h-5" />,
    href: '/mates/content',
  },
  {
    title: 'Wellness Plan',
    icon: <TargetIcon className="w-5 h-5" />,
    href: '/mates/plan',
  },
  {
    title: 'Self-Care Hub',
    icon: <HeartPulseIcon className="w-5 h-5" />,
    href: '/mates/selfcare',
  },
];

// Main feature cards
const mainFeatures = [
  {
    title: 'Virtual Therapy',
    description: 'Connect with a licensed therapist for professional support',
    icon: MessageCircleIcon,
    href: '/mates/therapy',
    gradient: 'lavender' as const,
  },
  {
    title: 'Meditation Zone',
    description: 'Find your calm with guided meditations',
    icon: HeadphonesIcon,
    href: '/mates/meditation',
    gradient: 'ocean' as const,
  },
  {
    title: 'Digital Journal',
    description: 'Private space for your thoughts and reflections',
    icon: BookMarkedIcon,
    href: '/mates/journal',
    gradient: 'sunset' as const,
  },
  {
    title: 'Mood Tracker',
    description: 'Log and visualize your emotional patterns',
    icon: BarChartIcon,
    href: '/mates/mood',
    gradient: 'lavender' as const,
  },
  {
    title: 'Mind Gym',
    description: 'Exercises for cognitive and emotional fitness',
    icon: BrainCircuitIcon,
    href: '/mates/mindgym',
    gradient: 'ocean' as const,
  },
  {
    title: 'Wellness Resources',
    description: 'Articles and tools for mental wellbeing',
    icon: BookOpenIcon,
    href: '/mates/resources',
    gradient: 'sunset' as const,
  }
  ]

export default function MatesPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2 text-light-text dark:text-dark-text">
            Your Mates 🤝
          </h1>
          <p className="text-light-text/80 dark:text-dark-text/70">
            Choose a companion to support your wellness journey
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-20 flex-shrink-0">
            <Sidebar>
              {sidebarFeatures.map((feature) => (
                <SidebarIcon
                  key={feature.href}
                  icon={feature.icon}
                  label={feature.title}
                  href={feature.href}
                  isActive={activeFeature === feature.href}
                  onClick={() => setActiveFeature(feature.href)}
                />
              ))}
            </Sidebar>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Main Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainFeatures.map((feature) => (
                <CardFeature
                  key={feature.href}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  href={feature.href}
                  gradient={feature.gradient}
                />
              ))}
            </div>

            {/* Quick Access Section */}
            <div className="mt-12 card p-6">
              <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sidebarFeatures.map((feature) => (
                  <a
                    key={feature.href}
                    href={feature.href}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-light-bg/50 dark:hover:bg-dark-card transition-colors"
                  >
                    <span className="text-brand">{feature.icon}</span>
                    <span className="text-sm font-medium text-light-text/90 dark:text-dark-text/90">
                      {feature.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
