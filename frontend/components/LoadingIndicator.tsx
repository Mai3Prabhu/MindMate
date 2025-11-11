'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show loading indicator on route change
    setIsLoading(true)
    
    // Hide after a short delay (route has loaded)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          {/* Progress Bar */}
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-1 bg-gradient-to-r from-brand via-purple-500 to-brand"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
