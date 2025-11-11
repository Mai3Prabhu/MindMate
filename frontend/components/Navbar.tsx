'use client'

import Link from 'next/link'
import { Brain, User, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Redirect to home
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      window.location.href = '/'
    }
  }

  if (!mounted) return null

  return (
    <nav 
      className="sticky top-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border"
      aria-label="Main navigation"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 font-heading font-bold text-xl text-brand hover:text-brand-deep transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
            aria-label="MindMate home"
          >
            <Brain className="w-6 h-6" aria-hidden="true" />
            <span>MindMate</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-deep transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="User profile menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-controls="profile-menu"
              >
                U
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    
                    {/* Dropdown Menu */}
                    <motion.div
                      id="profile-menu"
                      role="menu"
                      aria-orientation="vertical"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 card p-2 z-50"
                    >
                      <Link
                        href="/profile"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-deep transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" aria-hidden="true" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-deep transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" aria-hidden="true" />
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" aria-hidden="true" />
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
