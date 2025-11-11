'use client'

import { motion } from 'framer-motion'
import { Library } from 'lucide-react'
import AppLayout from '@/components/AppLayout'

export default function LibraryPage() {
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <Library className="w-8 h-8 text-brand" />
          <h1 className="text-3xl font-heading font-bold">Content Library</h1>
        </div>
        <div className="card p-8">
          <p className="text-gray-600 dark:text-gray-400">
            Curated wellness resources coming soon...
          </p>
        </div>
      </motion.div>
    </AppLayout>
  )
}
