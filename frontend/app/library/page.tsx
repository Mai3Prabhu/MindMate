'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Library, Search, FileText, Video, Headphones, Activity, SlidersHorizontal } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import ContentCard from '@/components/library/ContentCard'
import useSWR from 'swr'

interface ContentItem {
  id: string
  title: string
  type: string
  category: string
  duration: string
  thumbnail: string
  description: string
  link: string
  tags?: string[]
}

const categories = [
  'All',
  'Mindful',
  'Emotional Wellness',
  'Cognitive',
  'Relationships',
  'Stress Management',
  'Sleep & Relaxation',
  'Productivity'
]

const contentTypes = [
  { label: 'All', icon: SlidersHorizontal, value: 'All' },
  { label: 'Articles', icon: FileText, value: 'Article' },
  { label: 'Videos', icon: Video, value: 'Video' },
  { label: 'Podcasts', icon: Headphones, value: 'Podcast' },
  { label: 'Activities', icon: Activity, value: 'Activity' },
]

const sortOptions = ['Newest', 'Most Saved', 'Trending']

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const [localContent, setLocalContent] = useState<ContentItem[]>([])

  // Load local content as fallback
  useEffect(() => {
    fetch('/data/content.json')
      .then(res => res.json())
      .then(data => setLocalContent(data))
      .catch(err => console.error('Error loading local content:', err))
  }, [])

  // Fetch content from backend
  const { data: contentData, error, mutate } = useSWR<ContentItem[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/library/content?category=${selectedCategory}&type=${selectedType}&search=${searchQuery}`,
    fetcher,
    {
      fallbackData: localContent,
      revalidateOnMount: true
    }
  )

  const handleContentInteraction = async (contentId: string, action: 'like' | 'save' | 'view') => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/library/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content_id: contentId,
          [action === 'like' ? 'liked' : action === 'save' ? 'saved' : 'viewed']: true
        })
      })
      mutate() // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing content:`, error)
    }
  }

  // Use backend data if available, otherwise use local content with client-side filtering
  let filteredContent = contentData || localContent

  // Apply client-side filtering if using local content
  if (!contentData && localContent.length > 0) {
    filteredContent = localContent.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchesType = selectedType === 'All' || item.type === selectedType
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesType && matchesSearch
    })
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Library className="w-8 h-8 text-brand" />
            <h1 className="text-4xl font-heading font-bold">Content Library</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Curated wellness resources for your emotional and mental wellbeing
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, videos, podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border focus:border-brand focus:outline-none transition-colors text-lg"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-brand text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-dark-deep text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Type Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 flex-wrap">
            {contentTypes.map(({ label, icon: Icon, value }) => (
              <button
                key={value}
                onClick={() => setSelectedType(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedType === value
                    ? 'bg-brand/20 text-brand border-2 border-brand'
                    : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-brand/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sort Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredContent.length} {filteredContent.length === 1 ? 'resource' : 'resources'} found
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border focus:border-brand focus:outline-none text-sm"
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          {filteredContent.length > 0 ? (
            <motion.div
              key="content-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentCard
                    {...item}
                    onOpen={() => window.open(item.link, '_blank')}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card p-12 text-center"
            >
              <Library className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No resources found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* This Week's Picks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-brand/10 to-purple-500/10 border-2 border-brand/20"
        >
          <h2 className="text-2xl font-bold mb-2">📅 This Week's Picks</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Handpicked resources to support your wellness journey
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentData && contentData.slice(0, 3).map((item: ContentItem) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer"
                onClick={() => window.open(item.link, '_blank')}
              >
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.duration}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
