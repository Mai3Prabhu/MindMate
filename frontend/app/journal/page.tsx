'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Calendar, Palette, Plus, List } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import JournalEditor from '@/components/journal/JournalEditor'
import JournalCalendar from '@/components/journal/JournalCalendar'
import { journalAPI } from '@/lib/api'

interface JournalEntry {
  id: string
  content: string
  mood_tag?: string
  theme: string
  timestamp: string
}

export default function JournalPage() {
  const [isUnlocked, setIsUnlocked] = useState(true) // PIN lock disabled
  const [showCalendar, setShowCalendar] = useState(false)
  const [theme, setTheme] = useState<string>('minimal')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadEntries()
    // Load saved theme preference
    const savedTheme = localStorage.getItem('journal_theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const loadEntries = async () => {
    try {
      const data = await journalAPI.getEntries(10)
      setEntries(data as JournalEntry[])
    } catch (error) {
      console.error('Error loading entries:', error)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('journal_theme', newTheme)
  }

  const handleSave = (entryId: string) => {
    loadEntries()
    setRefreshTrigger(prev => prev + 1)
    setIsCreatingNew(false)
    setSelectedEntry(null)
  }

  const handleNewEntry = () => {
    setSelectedEntry(null)
    setIsCreatingNew(true)
    setShowCalendar(false)
  }

  const themes = [
    { 
      value: 'minimal', 
      label: 'Minimal', 
      bgClass: 'bg-white dark:bg-dark-bg',
      bgStyle: {},
      hasImage: false
    },
    { 
      value: 'nature-forest', 
      label: 'Nature', 
      bgClass: '',
      bgStyle: { 
        background: 'linear-gradient(to bottom right, rgb(240 253 244), rgb(209 250 229))'
      },
      darkBgStyle: {
        background: 'linear-gradient(to bottom right, rgba(20 83 45 / 0.2), rgba(6 78 59 / 0.2))'
      },
      hasImage: true,
      image: '/journal-themes/nature-bg.jpg'
    },
    { 
      value: 'ocean', 
      label: 'Ocean', 
      bgClass: '',
      bgStyle: { 
        background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(207 250 254))'
      },
      darkBgStyle: {
        background: 'linear-gradient(to bottom right, rgba(30 58 138 / 0.2), rgba(8 51 68 / 0.2))'
      },
      hasImage: true,
      image: '/journal-themes/ocean-bg.jpg'
    },
    { 
      value: 'night', 
      label: 'Night', 
      bgClass: '',
      bgStyle: { 
        background: 'linear-gradient(to bottom right, rgb(238 242 255), rgb(243 232 255))'
      },
      darkBgStyle: {
        background: 'linear-gradient(to bottom right, rgba(49 46 129 / 0.2), rgba(88 28 135 / 0.2))'
      },
      hasImage: true,
      image: '/journal-themes/night-bg.jpg'
    },
    { 
      value: 'zen', 
      label: 'Zen', 
      bgClass: '',
      bgStyle: { 
        background: 'linear-gradient(to bottom right, rgb(249 250 251), rgb(250 250 249))'
      },
      darkBgStyle: {
        background: 'linear-gradient(to bottom right, rgba(17 24 39 / 0.2), rgba(41 37 36 / 0.2))'
      },
      hasImage: true,
      image: '/journal-themes/zen.jpg'
    },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  
  // Determine if dark mode is active
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // PIN lock disabled - direct access to journal
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand" />
            <div>
              <h1 className="text-3xl font-heading font-bold">Digital Journal</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your private, encrypted space
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                showCalendar
                  ? 'bg-brand text-white'
                  : 'border-2 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-deep'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Streaks
            </button>
            
            <button
              onClick={handleNewEntry}
              className="px-4 py-2 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Theme Selection */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-brand" />
                <h3 className="font-semibold">Theme</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === t.value
                        ? 'border-brand'
                        : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
                    }`}
                  >
                    <div 
                      className={`w-full h-8 rounded mb-2 ${t.bgClass}`}
                      style={isDark && t.darkBgStyle ? t.darkBgStyle : t.bgStyle}
                    />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Entries */}
            {!showCalendar && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <List className="w-4 h-4 text-brand" />
                  <h3 className="font-semibold">Recent Entries</h3>
                </div>
                <div className="space-y-2">
                  {entries.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No entries yet. Start writing!
                    </p>
                  ) : (
                    entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => {
                          setSelectedEntry(entry)
                          setIsCreatingNew(false)
                          setShowCalendar(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedEntry?.id === entry.id
                            ? 'bg-brand/10 border-2 border-brand'
                            : 'bg-gray-50 dark:bg-dark-deep hover:bg-gray-100 dark:hover:bg-dark-card'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm line-clamp-2">
                          {entry.content.substring(0, 100)}...
                        </div>
                        {entry.mood_tag && (
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-brand/20 text-brand rounded-full">
                            {entry.mood_tag}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div 
              key={theme}
              className={`card p-6 min-h-[600px] relative overflow-hidden transition-all duration-300 ${currentTheme.bgClass}`}
              style={{
                ...(isDark && currentTheme.darkBgStyle ? currentTheme.darkBgStyle : currentTheme.bgStyle),
                isolation: 'isolate'
              }}
            >
              {/* Background Image with Smooth Transitions */}
              {currentTheme.hasImage && currentTheme.image && (
                <motion.div 
                  key={currentTheme.image}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 0 }}
                >
                  <img
                    src={currentTheme.image}
                    alt={currentTheme.label}
                    className="w-full h-full object-cover transition-all duration-700"
                    style={{ 
                      opacity: isDark ? 0.15 : 0.25,
                      filter: 'blur(0.5px)'
                    }}
                    onError={(e) => {
                      console.error('Failed to load image:', currentTheme.image)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div 
                    className="absolute inset-0 backdrop-blur-[0.5px]" 
                    style={{
                      background: isDark 
                        ? 'linear-gradient(to bottom, rgba(15, 14, 20, 0.75), rgba(15, 14, 20, 0.85), rgba(15, 14, 20, 0.92))'
                        : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.92))'
                    }}
                  />
                </motion.div>
              )}
              <div className="relative" style={{ zIndex: 1 }}>
                <AnimatePresence mode="wait">
                  {showCalendar ? (
                    <motion.div
                      key="calendar"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <JournalCalendar refreshTrigger={refreshTrigger} />
                    </motion.div>
                  ) : isCreatingNew || selectedEntry ? (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <JournalEditor
                        entryId={selectedEntry?.id}
                        initialContent={selectedEntry?.content}
                        initialMoodTag={selectedEntry?.mood_tag}
                        initialTheme={theme}
                        onSave={handleSave}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-full"
                    >
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Start Writing
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Create a new entry or select one from the sidebar
                      </p>
                      <button
                        onClick={handleNewEntry}
                        className="px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep transition-colors"
                      >
                        New Entry
                      </button>
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  )
}
