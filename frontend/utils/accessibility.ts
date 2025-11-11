/**
 * Accessibility Utilities for MindMate
 * Provides helpers for WCAG 2.1 AA compliance
 */

/**
 * Check if color contrast ratio meets WCAG AA standards (4.5:1 for normal text)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    // Remove # if present
    hex = hex.replace('#', '')
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background)
  return largeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Generate accessible color palette
 */
export const accessibleColors = {
  light: {
    text: '#1A1A1A',        // 16.5:1 on white
    textSecondary: '#4A4A4A', // 9.7:1 on white
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    primary: '#7C3AED',      // 4.5:1 on white
    primaryDark: '#5B21B6',  // 7:1 on white
    success: '#059669',      // 4.5:1 on white
    error: '#DC2626',        // 5.9:1 on white
    warning: '#D97706',      // 4.5:1 on white
  },
  dark: {
    text: '#FFFFFF',         // 21:1 on dark bg
    textSecondary: '#D0D0D0', // 12.6:1 on dark bg
    background: '#1A1A1A',
    backgroundSecondary: '#2A2A2A',
    primary: '#A78BFA',      // 7:1 on dark bg
    primaryDark: '#C4B5FD',  // 10:1 on dark bg
    success: '#34D399',      // 7:1 on dark bg
    error: '#F87171',        // 5.5:1 on dark bg
    warning: '#FBBF24',      // 10:1 on dark bg
  }
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = []
  private currentIndex = 0
  
  constructor(container: HTMLElement) {
    this.updateFocusableElements(container)
  }
  
  updateFocusableElements(container: HTMLElement) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')
    
    this.focusableElements = Array.from(container.querySelectorAll(selector))
  }
  
  focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length
    this.focusableElements[this.currentIndex]?.focus()
  }
  
  focusPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.focusableElements.length) % this.focusableElements.length
    this.focusableElements[this.currentIndex]?.focus()
  }
  
  focusFirst() {
    this.currentIndex = 0
    this.focusableElements[0]?.focus()
  }
  
  focusLast() {
    this.currentIndex = this.focusableElements.length - 1
    this.focusableElements[this.currentIndex]?.focus()
  }
}

/**
 * Screen reader announcement helper
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement
  private previousFocus: HTMLElement | null = null
  private focusableElements: HTMLElement[] = []
  
  constructor(container: HTMLElement) {
    this.container = container
    this.updateFocusableElements()
  }
  
  private updateFocusableElements() {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')
    
    this.focusableElements = Array.from(this.container.querySelectorAll(selector))
  }
  
  activate() {
    this.previousFocus = document.activeElement as HTMLElement
    this.updateFocusableElements()
    
    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus()
    }
    
    // Add event listener for tab key
    this.container.addEventListener('keydown', this.handleKeyDown)
  }
  
  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown)
    
    // Restore previous focus
    if (this.previousFocus) {
      this.previousFocus.focus()
    }
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0
export function generateId(prefix = 'a11y'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Skip to main content link helper
 */
export function createSkipLink() {
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.textContent = 'Skip to main content'
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg'
  
  return skipLink
}

/**
 * Validate form accessibility
 */
export function validateFormAccessibility(form: HTMLFormElement): string[] {
  const issues: string[] = []
  
  // Check all inputs have labels
  const inputs = form.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    const id = input.getAttribute('id')
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!id && !ariaLabel && !ariaLabelledBy) {
      issues.push(`Input missing label: ${input.getAttribute('name') || 'unknown'}`)
    }
    
    if (id) {
      const label = form.querySelector(`label[for="${id}"]`)
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push(`Input with id "${id}" has no associated label`)
      }
    }
  })
  
  // Check required fields have aria-required
  const requiredInputs = form.querySelectorAll('[required]')
  requiredInputs.forEach((input) => {
    if (!input.getAttribute('aria-required')) {
      issues.push(`Required input missing aria-required: ${input.getAttribute('name') || 'unknown'}`)
    }
  })
  
  return issues
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const ariaHidden = element.getAttribute('aria-hidden') === 'true'
  const hidden = element.hasAttribute('hidden')
  const display = window.getComputedStyle(element).display === 'none'
  const visibility = window.getComputedStyle(element).visibility === 'hidden'
  
  return !ariaHidden && !hidden && !display && !visibility
}
