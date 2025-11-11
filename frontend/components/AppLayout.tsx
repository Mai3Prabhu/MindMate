'use client'

import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PanelTriggers from './PanelTriggers'
import LoadingIndicator from './LoadingIndicator'
import { useState, useEffect } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Add skip link on mount
  useEffect(() => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
    skipLink.setAttribute('aria-label', 'Skip to main content')
    
    document.body.insertBefore(skipLink, document.body.firstChild)
    
    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Global Loading Indicator */}
      <LoadingIndicator />
      
      <Navbar />
      <div className="flex">
        <Sidebar />
        <motion.main
          id="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 ml-64 mt-16 p-6 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '80px' : '256px' }}
          role="main"
          aria-label="Main content"
        >
          {children}
        </motion.main>
      </div>
      
      {/* Side Panel Triggers - Available on all authenticated pages */}
      <PanelTriggers />
    </div>
  )
}
