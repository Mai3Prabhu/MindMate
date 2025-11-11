'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Mic,
  MessageSquare,
  Brain,
  Music,
  Library,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

interface NavLink {
  href: string
  label: string
  icon: React.ElementType
}

const navLinks: NavLink[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/therapy', label: 'Therapy', icon: MessageCircle },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/feelhear', label: 'FeelHear', icon: Mic },
  { href: '/feelflow', label: 'FeelFlow', icon: MessageSquare },
  { href: '/braingym', label: 'Brain Gym', icon: Brain },
  { href: '/symphony', label: 'Symphony', icon: Music },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/wellness', label: 'Wellness', icon: Activity },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border z-40 overflow-hidden"
      aria-label="Feature navigation"
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center hover:bg-brand-deep transition-colors shadow-md z-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* Navigation Links */}
        <nav 
          className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin"
          aria-label="Main features"
        >
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-brand text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-deep'
                }`}
                title={isCollapsed ? link.label : undefined}
                aria-label={link.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-brand'
                  }`}
                  aria-hidden="true"
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`font-medium whitespace-nowrap overflow-hidden ${
                        isActive ? 'text-white' : ''
                      }`}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>
      </div>
    </motion.aside>
  )
}
