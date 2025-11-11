'use client'

import { Suspense, ComponentType } from 'react'
import { motion } from 'framer-motion'

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Wrapper component for lazy loading with suspense
 */
export default function LazyLoad({ children, fallback }: LazyLoadProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full"
      />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

/**
 * Loading skeleton for content
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-5/6" />
      <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-4/6" />
    </div>
  )
}

/**
 * Loading skeleton for cards
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-3/4 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
