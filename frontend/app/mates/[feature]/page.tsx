'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function FeaturePage() {
  const pathname = usePathname()
  const featureName = pathname.split('/').pop() || 'Feature'
  const title = featureName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {title} feature is coming soon. We're working hard to bring you this functionality.
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-700 dark:text-gray-300">
            This is a placeholder for the {title.toLowerCase()} feature. Check back soon for updates!
          </p>
        </div>
      </main>
    </div>
  )
}
