/**
 * Keyboard Shortcuts Modal
 * Displays available keyboard shortcuts for the application
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import AccessibleModal from './AccessibleModal'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Tab'], description: 'Navigate forward', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backward', category: 'Navigation' },
  { keys: ['Enter'], description: 'Activate button/link', category: 'Navigation' },
  { keys: ['Space'], description: 'Activate button', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close modal/dropdown', category: 'Navigation' },
  
  // Therapy
  { keys: ['Enter'], description: 'Send message (in chat)', category: 'Therapy' },
  { keys: ['Shift', 'Enter'], description: 'New line (in chat)', category: 'Therapy' },
  
  // Journal
  { keys: ['Ctrl/Cmd', 'S'], description: 'Save journal entry', category: 'Journal' },
  { keys: ['Ctrl/Cmd', 'B'], description: 'Bold text', category: 'Journal' },
  { keys: ['Ctrl/Cmd', 'I'], description: 'Italic text', category: 'Journal' },
  { keys: ['Ctrl/Cmd', 'U'], description: 'Underline text', category: 'Journal' },
  
  // Global
  { keys: ['Ctrl/Cmd', '/'], description: 'Show keyboard shortcuts', category: 'Global' },
  { keys: ['Alt', 'T'], description: 'Toggle theme', category: 'Global' },
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to open shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-brand text-white rounded-full shadow-lg hover:bg-brand-deep transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Ctrl+/)"
      >
        <Keyboard className="w-6 h-6" aria-hidden="true" />
      </button>
      
      {/* Modal */}
      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard Shortcuts"
        description="Navigate MindMate efficiently with these keyboard shortcuts"
        size="lg"
      >
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">/</kbd> anytime to view this list.
            </p>
          </div>
        </div>
      </AccessibleModal>
    </>
  )
}
