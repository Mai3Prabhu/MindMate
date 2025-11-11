/**
 * Accessible Modal Component
 * Implements focus trap, keyboard navigation, and ARIA attributes
 */

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useFocusTrap, useKeyboardNavigation } from '@/hooks/useAccessibility'

interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
}

export default function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}: AccessibleModalProps) {
  const containerRef = useFocusTrap(isOpen)
  
  // Close on Escape key
  useKeyboardNavigation(onClose)
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Close modal"
                >
                  <X size={24} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
