/**
 * Accessibility Audit Utility
 * Checks for common accessibility issues in the application
 */

import { getContrastRatio, meetsWCAGAA } from './accessibility'

export interface AccessibilityIssue {
  type: 'error' | 'warning'
  category: 'contrast' | 'aria' | 'semantic' | 'keyboard' | 'alt-text' | 'labels'
  element: string
  message: string
  wcagCriterion?: string
}

export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = []
  
  /**
   * Run full accessibility audit on the page
   */
  audit(): AccessibilityIssue[] {
    this.issues = []
    
    this.checkColorContrast()
    this.checkAriaAttributes()
    this.checkSemanticHTML()
    this.checkKeyboardAccessibility()
    this.checkAltText()
    this.checkFormLabels()
    this.checkHeadingHierarchy()
    this.checkLandmarks()
    
    return this.issues
  }
  
  /**
   * Check color contrast ratios
   */
  private checkColorContrast() {
    const elements = document.querySelectorAll('*')
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      // Skip if no background color
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return
      }
      
      // Convert RGB to hex
      const rgbToHex = (rgb: string): string => {
        const match = rgb.match(/\d+/g)
        if (!match) return '#000000'
        
        const [r, g, b] = match.map(Number)
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
      }
      
      const foreground = rgbToHex(color)
      const background = rgbToHex(backgroundColor)
      
      const fontSize = parseFloat(styles.fontSize)
      const fontWeight = parseInt(styles.fontWeight)
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700)
      
      if (!meetsWCAGAA(foreground, background, isLargeText)) {
        const ratio = getContrastRatio(foreground, background)
        this.issues.push({
          type: 'error',
          category: 'contrast',
          element: element.tagName.toLowerCase(),
          message: `Insufficient color contrast (${ratio.toFixed(2)}:1). Required: ${isLargeText ? '3:1' : '4.5:1'}`,
          wcagCriterion: '1.4.3 Contrast (Minimum)'
        })
      }
    })
  }
  
  /**
   * Check ARIA attributes
   */
  private checkAriaAttributes() {
    // Check for invalid ARIA attributes
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]')
    
    elementsWithAria.forEach((element) => {
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledBy = element.getAttribute('aria-labelledby')
      const ariaDescribedBy = element.getAttribute('aria-describedby')
      
      // Check if aria-labelledby references exist
      if (ariaLabelledBy) {
        const ids = ariaLabelledBy.split(' ')
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            this.issues.push({
              type: 'error',
              category: 'aria',
              element: element.tagName.toLowerCase(),
              message: `aria-labelledby references non-existent ID: ${id}`,
              wcagCriterion: '4.1.2 Name, Role, Value'
            })
          }
        })
      }
      
      // Check if aria-describedby references exist
      if (ariaDescribedBy) {
        const ids = ariaDescribedBy.split(' ')
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            this.issues.push({
              type: 'error',
              category: 'aria',
              element: element.tagName.toLowerCase(),
              message: `aria-describedby references non-existent ID: ${id}`,
              wcagCriterion: '4.1.2 Name, Role, Value'
            })
          }
        })
      }
      
      // Check for empty aria-label
      if (ariaLabel === '') {
        this.issues.push({
          type: 'error',
          category: 'aria',
          element: element.tagName.toLowerCase(),
          message: 'Empty aria-label attribute',
          wcagCriterion: '4.1.2 Name, Role, Value'
        })
      }
    })
  }
  
  /**
   * Check semantic HTML usage
   */
  private checkSemanticHTML() {
    // Check for divs/spans used as buttons
    const clickableDivs = document.querySelectorAll('div[onclick], span[onclick]')
    clickableDivs.forEach((element) => {
      if (!element.getAttribute('role')) {
        this.issues.push({
          type: 'warning',
          category: 'semantic',
          element: element.tagName.toLowerCase(),
          message: 'Clickable div/span should use <button> or have role="button"',
          wcagCriterion: '4.1.2 Name, Role, Value'
        })
      }
    })
    
    // Check for proper heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    let previousLevel = 0
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1])
      
      if (level - previousLevel > 1) {
        this.issues.push({
          type: 'warning',
          category: 'semantic',
          element: heading.tagName.toLowerCase(),
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          wcagCriterion: '1.3.1 Info and Relationships'
        })
      }
      
      previousLevel = level
    })
  }
  
  /**
   * Check keyboard accessibility
   */
  private checkKeyboardAccessibility() {
    // Check for interactive elements without tabindex
    const interactive = document.querySelectorAll('[onclick], [role="button"], [role="link"]')
    
    interactive.forEach((element) => {
      const tagName = element.tagName.toLowerCase()
      
      // Skip native interactive elements
      if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
        return
      }
      
      const tabindex = element.getAttribute('tabindex')
      if (tabindex === null || tabindex === '-1') {
        this.issues.push({
          type: 'error',
          category: 'keyboard',
          element: tagName,
          message: 'Interactive element not keyboard accessible (missing tabindex="0")',
          wcagCriterion: '2.1.1 Keyboard'
        })
      }
    })
  }
  
  /**
   * Check alt text on images
   */
  private checkAltText() {
    const images = document.querySelectorAll('img')
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt')
      const ariaLabel = img.getAttribute('aria-label')
      const ariaHidden = img.getAttribute('aria-hidden')
      
      // Decorative images should have empty alt or aria-hidden
      if (ariaHidden === 'true') {
        return
      }
      
      if (alt === null && !ariaLabel) {
        this.issues.push({
          type: 'error',
          category: 'alt-text',
          element: 'img',
          message: `Image missing alt text: ${img.src}`,
          wcagCriterion: '1.1.1 Non-text Content'
        })
      }
    })
  }
  
  /**
   * Check form labels
   */
  private checkFormLabels() {
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea')
    
    inputs.forEach((input) => {
      const id = input.getAttribute('id')
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledBy = input.getAttribute('aria-labelledby')
      const type = input.getAttribute('type')
      
      // Skip submit/button inputs
      if (type === 'submit' || type === 'button') {
        return
      }
      
      // Check if input has a label
      if (!id && !ariaLabel && !ariaLabelledBy) {
        this.issues.push({
          type: 'error',
          category: 'labels',
          element: input.tagName.toLowerCase(),
          message: 'Form input missing label',
          wcagCriterion: '3.3.2 Labels or Instructions'
        })
        return
      }
      
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (!label && !ariaLabel && !ariaLabelledBy) {
          this.issues.push({
            type: 'error',
            category: 'labels',
            element: input.tagName.toLowerCase(),
            message: `Form input with id "${id}" has no associated label`,
            wcagCriterion: '3.3.2 Labels or Instructions'
          })
        }
      }
    })
  }
  
  /**
   * Check heading hierarchy
   */
  private checkHeadingHierarchy() {
    const h1s = document.querySelectorAll('h1')
    
    if (h1s.length === 0) {
      this.issues.push({
        type: 'warning',
        category: 'semantic',
        element: 'page',
        message: 'Page missing h1 heading',
        wcagCriterion: '1.3.1 Info and Relationships'
      })
    }
    
    if (h1s.length > 1) {
      this.issues.push({
        type: 'warning',
        category: 'semantic',
        element: 'page',
        message: 'Page has multiple h1 headings',
        wcagCriterion: '1.3.1 Info and Relationships'
      })
    }
  }
  
  /**
   * Check ARIA landmarks
   */
  private checkLandmarks() {
    const main = document.querySelector('main, [role="main"]')
    const nav = document.querySelector('nav, [role="navigation"]')
    
    if (!main) {
      this.issues.push({
        type: 'warning',
        category: 'semantic',
        element: 'page',
        message: 'Page missing <main> landmark',
        wcagCriterion: '1.3.1 Info and Relationships'
      })
    }
    
    if (!nav) {
      this.issues.push({
        type: 'warning',
        category: 'semantic',
        element: 'page',
        message: 'Page missing <nav> landmark',
        wcagCriterion: '1.3.1 Info and Relationships'
      })
    }
  }
  
  /**
   * Generate accessibility report
   */
  generateReport(): string {
    const errors = this.issues.filter(i => i.type === 'error')
    const warnings = this.issues.filter(i => i.type === 'warning')
    
    let report = '=== Accessibility Audit Report ===\n\n'
    report += `Total Issues: ${this.issues.length}\n`
    report += `Errors: ${errors.length}\n`
    report += `Warnings: ${warnings.length}\n\n`
    
    if (errors.length > 0) {
      report += '--- ERRORS ---\n'
      errors.forEach((issue, index) => {
        report += `${index + 1}. [${issue.category}] ${issue.message}\n`
        report += `   Element: ${issue.element}\n`
        if (issue.wcagCriterion) {
          report += `   WCAG: ${issue.wcagCriterion}\n`
        }
        report += '\n'
      })
    }
    
    if (warnings.length > 0) {
      report += '--- WARNINGS ---\n'
      warnings.forEach((issue, index) => {
        report += `${index + 1}. [${issue.category}] ${issue.message}\n`
        report += `   Element: ${issue.element}\n`
        if (issue.wcagCriterion) {
          report += `   WCAG: ${issue.wcagCriterion}\n`
        }
        report += '\n'
      })
    }
    
    return report
  }
}

/**
 * Run accessibility audit and log results
 */
export function runAccessibilityAudit() {
  const auditor = new AccessibilityAuditor()
  const issues = auditor.audit()
  
  if (issues.length > 0) {
    console.group('🔍 Accessibility Audit Results')
    console.log(auditor.generateReport())
    console.groupEnd()
  } else {
    console.log('✅ No accessibility issues found!')
  }
  
  return issues
}
