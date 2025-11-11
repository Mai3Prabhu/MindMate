/**
 * Accessibility Hooks for MindMate
 */

import { useEffect, useRef, useState } from 'react'
import { FocusTrap, announceToScreenReader } from '@/utils/accessibility'

/**
 * Hook for managing focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const focusTrapRef = useRef<FocusTrap | null>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    if (isActive) {
      focusTrapRef.current = new FocusTrap(containerRef.current)
      focusTrapRef.current.activate()
    }
    
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate()
      }
    }
  }, [isActive])
  
  return containerRef
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(onEscape?: () => void, onEnter?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
      }
      if (e.key === 'Enter' && onEnter) {
        onEnter()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, onEnter])
}

/**
 * Hook for screen reader announcements
 */
export function useAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority)
  }
  
  return announce
}

/**
 * Hook for managing ARIA live regions
 */
export function useAriaLive() {
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite')
  
  const announce = (msg: string, prio: 'polite' | 'assertive' = 'polite') => {
    setMessage(msg)
    setPriority(prio)
    
    // Clear after announcement
    setTimeout(() => setMessage(''), 1000)
  }
  
  return { message, priority, announce }
}

/**
 * Hook for managing focus on mount
 */
export function useAutoFocus(shouldFocus = true) {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus()
    }
  }, [shouldFocus])
  
  return ref
}

/**
 * Hook for detecting reduced motion preference
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

/**
 * Hook for managing skip links
 */
export function useSkipLink() {
  useEffect(() => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400'
    skipLink.setAttribute('aria-label', 'Skip to main content')
    
    document.body.insertBefore(skipLink, document.body.firstChild)
    
    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink)
      }
    }
  }, [])
}

/**
 * Hook for managing document title for screen readers
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} - MindMate`
    
    // Announce page change to screen readers
    announceToScreenReader(`Navigated to ${title}`)
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}

/**
 * Hook for managing ARIA expanded state
 */
export function useAriaExpanded(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState)
  
  const toggle = () => {
    setIsExpanded(!isExpanded)
    announceToScreenReader(isExpanded ? 'Collapsed' : 'Expanded')
  }
  
  return { isExpanded, toggle, setIsExpanded }
}

/**
 * Hook for managing loading states with screen reader announcements
 */
export function useLoadingAnnouncement(isLoading: boolean, loadingMessage = 'Loading', completeMessage = 'Content loaded') {
  useEffect(() => {
    if (isLoading) {
      announceToScreenReader(loadingMessage, 'polite')
    } else {
      announceToScreenReader(completeMessage, 'polite')
    }
  }, [isLoading, loadingMessage, completeMessage])
}
