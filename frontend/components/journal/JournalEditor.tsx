'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Smile, Calendar, Tag } from 'lucide-react'
import { journalAPI } from '@/lib/api'

interface JournalEditorProps {
  entryId?: string
  initialContent?: string
  initialMoodTag?: string
  initialTheme: string
  onSave: (entryId: string) => void
}

const moodTags = [
  { label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
  { label: 'Excited', emoji: '🤩', color: 'bg-orange-100 text-orange-800' },
  { label: 'Grateful', emoji: '🙏', color: 'bg-green-100 text-green-800' },
  { label: 'Reflective', emoji: '🤔', color: 'bg-purple-100 text-purple-800' },
  { label: 'Anxious', emoji: '😰', color: 'bg-red-100 text-red-800' },
  { label: 'Sad', emoji: '😢', color: 'bg-gray-100 text-gray-800' },
  { label: 'Peaceful', emoji: '☮️', color: 'bg-indigo-100 text-indigo-800' },
]

export default function JournalEditor({
  entryId,
  initialContent = '',
  initialMoodTag = '',
  initialTheme,
  onSave
}: JournalEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [moodTag, setMoodTag] = useState(initialMoodTag)
  const [isSaving, setIsSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showMoodSelector, setShowMoodSelector] = useState(false)

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      let savedEntryId = entryId

      if (entryId) {
        // Update existing entry
        await journalAPI.updateEntry(entryId, {
          content: content.trim(),
          mood_tag: moodTag || undefined,
          theme: initialTheme
        })
      } else {
        // Create new entry
        const newEntry = await journalAPI.createEntry({
          content: content.trim(),
          mood_tag: moodTag || undefined,
          theme: initialTheme
        })
        savedEntryId = newEntry.id
      }

      onSave(savedEntryId!)
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand" />
          <div>
            <h3 className="font-semibold">
              {entryId ? 'Edit Entry' : 'New Entry'}
            </h3>
            <p className="text-sm text-gray-500">{getCurrentDate()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMoodSelector(!showMoodSelector)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-dark-deep hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg transition-colors"
          >
            <Smile className="w-4 h-4" />
            <span className="text-sm">Mood</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="text-sm">Save</span>
          </button>
        </div>
      </div>

      {/* Mood Selector */}
      {showMoodSelector && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-gray-50 dark:bg-dark-deep rounded-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium">How are you feeling?</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {moodTags.map((mood) => (
              <button
                key={mood.label}
                onClick={() => {
                  setMoodTag(moodTag === mood.label ? '' : mood.label)
                  setShowMoodSelector(false)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  moodTag === mood.label
                    ? 'bg-brand text-white scale-105'
                    : `${mood.color} hover:scale-105`
                }`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Selected Mood Display */}
      {moodTag && !showMoodSelector && (
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-brand/10 text-brand rounded-lg">
            <span>{moodTags.find(m => m.label === moodTag)?.emoji}</span>
            <span className="text-sm font-medium">{moodTag}</span>
            <button
              onClick={() => setMoodTag('')}
              className="ml-1 text-brand/70 hover:text-brand"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today? Write freely about your thoughts, feelings, experiences, or anything you'd like to remember..."
          className="flex-1 w-full p-4 border-0 bg-transparent resize-none focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          style={{ minHeight: '300px' }}
          autoFocus
        />

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="text-sm text-gray-500">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
          
          <div className="text-xs text-gray-400">
            {entryId ? 'Last saved: ' + new Date().toLocaleTimeString() : 'Unsaved changes'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}