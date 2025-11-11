'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Video, Headphones, ExternalLink, Check } from 'lucide-react'
import useSWR from 'swr'

interface ContentItem {
  id: string
  title: string
  url: string
  category: string
  type: string
  duration_min: number | null
  description: string | null
  created_at: string
}

interface ContentLibraryProps {
  isOpen: boolean
  onClose: () => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

const CATEGORIES = [
  { value: 'all', label: 'All Topics' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'emotional_wellness', label: 'Emotional Wellness' },
  { value: 'cognitive_health', label: 'Cognitive Health' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'stress_management', label: 'Stress Management' },
]

export default function ContentLibrary({ isOpen, onClose }: ContentLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const categoryParam = selectedCategory !== 'all' ? `category=${selectedCategory}` : ''
  const typeParam = selectedType ? `type=${selectedType}` : ''
  const params = [categoryParam, typeParam].filter(Boolean).join('&')
  
  const { data: items, error } = useSWR<ContentItem[]>(
    isOpen ? `${process.env.NEXT_PUBLIC_API_URL}/api/content/library?${params}` : null,
    fetcher
  )

  const handleOpenContent = async (item: ContentItem) => {
    try {
      // Track that content was opened
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content_id: item.id,
          action: 'opened',
        }),
      })

      // Open in new tab
      window.open(item.url, '_blank')
    } catch (error) {
      console.error('Error tracking content:', error)
      // Still open the content even if tracking fails
      window.open(item.url, '_blank')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'podcast':
        return <Headphones className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

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
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-dark-card shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Content Library</h2>
                    <p className="text-sm text-gray-500">Curated wellness resources</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-deep rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <div className="flex gap-2 mt-3">
                {['article', 'video', 'podcast'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors flex items-center gap-2 ${
                      selectedType === type
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    {getTypeIcon(type)}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-500">Failed to load content</p>
                </div>
              )}

              {!items && !error && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" />
                </div>
              )}

              {items && items.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No content found</p>
                </div>
              )}

              {items && items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-dark-deep rounded-xl hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => handleOpenContent(item)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white dark:bg-dark-card rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium group-hover:text-brand transition-colors">
                              {item.title}
                            </h3>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors flex-shrink-0" />
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs px-2 py-1 bg-white dark:bg-dark-card rounded capitalize">
                              {item.category.replace('_', ' ')}
                            </span>
                            {item.duration_min && (
                              <span className="text-xs text-gray-500">
                                {item.duration_min} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
