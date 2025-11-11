'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Heading1, Heading2, Save, Loader2, Check, Mic
} from 'lucide-react'
import { journalAPI } from '@/lib/api'

interface JournalEditorProps {
  entryId?: string
  initialContent?: string
  initialMoodTag?: string
  initialTheme?: string
  onSave?: (entryId: string) => void
}

export default function JournalEditor({
  entryId,
  initialContent = '',
  initialMoodTag,
  initialTheme = 'minimal',
  onSave
}: JournalEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [moodTag, setMoodTag] = useState(initialMoodTag || '')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isListening, setIsListening] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout>()
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          setContent(prev => prev + finalTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Auto-save every 10 seconds
  useEffect(() => {
    if (content && content !== initialContent) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true)
      }, 10000)
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [content])

  const handleSave = async (isAutoSave = false) => {
    if (!content.trim()) return

    try {
      setIsSaving(true)
      
      const data = {
        content,
        mood_tag: moodTag || undefined,
        theme: initialTheme,
      }
      
      let savedEntryId = entryId
      
      if (entryId) {
        await journalAPI.updateEntry(entryId, data)
      } else {
        const result = await journalAPI.createEntry(data)
        savedEntryId = result.id
      }
      
      setLastSaved(new Date())
      
      if (!isAutoSave && savedEntryId) {
        onSave?.(savedEntryId)
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
      return
    }
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const moods = ['Happy', 'Grateful', 'Calm', 'Anxious', 'Sad', 'Excited', 'Tired', 'Stressed']

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-dark-deep rounded-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => applyFormat('bold')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('italic')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('underline')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-dark-border mx-1" />
          
          <button
            onClick={() => applyFormat('formatBlock', '<h1>')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('formatBlock', '<h2>')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-dark-border mx-1" />
          
          <button
            onClick={() => applyFormat('insertUnorderedList')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('insertOrderedList')}
            className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-dark-border mx-1" />
          
          <button
            onClick={toggleVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'hover:bg-white dark:hover:bg-dark-card'
            }`}
            title="Voice to Text"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || !content.trim()}
            className="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => setContent(e.currentTarget.textContent || '')}
        className="min-h-[400px] p-6 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all prose prose-sm dark:prose-invert max-w-none"
        placeholder="Start writing..."
        suppressContentEditableWarning
      >
        {initialContent}
      </div>

      {/* Mood Tags */}
      <div>
        <label className="text-sm font-medium block mb-2">How are you feeling?</label>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setMoodTag(mood.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                moodTag === mood.toLowerCase()
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 dark:bg-dark-deep text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-700 dark:text-red-300">
            Listening... Speak now
          </span>
        </motion.div>
      )}
    </div>
  )
}
