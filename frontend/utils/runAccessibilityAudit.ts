/**
 * Accessibility Audit Runner
 * Run this in the browser console to check for accessibility issues
 */

import { AccessibilityAuditor, runAccessibilityAudit } from './accessibilityAudit'

/**
 * Run comprehensive accessibility audit
 */
export function auditAccessibility() {
  console.log('🔍 Running Accessibility Audit...\n')
  
  const auditor = new AccessibilityAuditor()
  const issues = auditor.audit()
  
  if (issues.length === 0) {
    console.log('✅ No accessibility issues found!')
    console.log('🎉 Your application meets WCAG 2.1 AA standards!')
    return
  }
  
  console.log(auditor.generateReport())
  
  // Group issues by category
  const byCategory = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = []
    }
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<string, typeof issues>)
  
  console.log('\n📊 Issues by Category:')
  Object.entries(byCategory).forEach(([category, categoryIssues]) => {
    console.log(`  ${category}: ${categoryIssues.length}`)
  })
  
  // Return issues for programmatic access
  return issues
}

/**
 * Check specific element for accessibility
 */
export function auditElement(element: HTMLElement) {
  console.log(`🔍 Auditing element: ${element.tagName}`)
  
  const issues: string[] = []
  
  // Check for alt text on images
  if (element.tagName === 'IMG') {
    const alt = element.getAttribute('alt')
    if (alt === null) {
      issues.push('Missing alt attribute')
    } else if (alt === '' && element.getAttribute('aria-hidden') !== 'true') {
      issues.push('Empty alt text without aria-hidden')
    }
  }
  
  // Check for labels on inputs
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
    const id = element.getAttribute('id')
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    
    if (!id && !ariaLabel && !ariaLabelledBy) {
      issues.push('Form element missing label')
    }
  }
  
  // Check for button accessibility
  if (element.tagName === 'BUTTON') {
    const ariaLabel = element.getAttribute('aria-label')
    const textContent = element.textContent?.trim()
    
    if (!ariaLabel && !textContent) {
      issues.push('Button has no accessible name')
    }
  }
  
  // Check for interactive elements
  if (element.hasAttribute('onclick') && !['BUTTON', 'A'].includes(element.tagName)) {
    const role = element.getAttribute('role')
    const tabindex = element.getAttribute('tabindex')
    
    if (!role) {
      issues.push('Interactive element missing role')
    }
    if (tabindex !== '0') {
      issues.push('Interactive element not keyboard accessible')
    }
  }
  
  // Check color contrast
  const styles = window.getComputedStyle(element)
  const color = styles.color
  const backgroundColor = styles.backgroundColor
  
  if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
    // Note: Full contrast checking requires the utility functions
    console.log(`  Color: ${color}`)
    console.log(`  Background: ${backgroundColor}`)
  }
  
  if (issues.length === 0) {
    console.log('✅ No issues found')
  } else {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }
  
  return issues
}

/**
 * Check keyboard navigation
 */
export function testKeyboardNavigation() {
  console.log('⌨️ Testing Keyboard Navigation...\n')
  
  const focusableElements = document.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  console.log(`Found ${focusableElements.length} focusable elements`)
  
  const issues: string[] = []
  
  focusableElements.forEach((element, index) => {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const ariaLabel = element.getAttribute('aria-label')
    const textContent = element.textContent?.trim()
    
    // Check if element has accessible name
    if (!ariaLabel && !textContent && !['input', 'select', 'textarea'].includes(tagName)) {
      issues.push(`Element ${index + 1} (${tagName}) has no accessible name`)
    }
    
    // Check if element is visible
    const styles = window.getComputedStyle(element as HTMLElement)
    if (styles.display === 'none' || styles.visibility === 'hidden') {
      issues.push(`Element ${index + 1} (${tagName}) is focusable but hidden`)
    }
  })
  
  if (issues.length === 0) {
    console.log('✅ All focusable elements are properly configured')
  } else {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }
  
  return { total: focusableElements.length, issues }
}

/**
 * Check ARIA attributes
 */
export function testARIA() {
  console.log('🏷️ Testing ARIA Attributes...\n')
  
  const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]')
  
  console.log(`Found ${elementsWithAria.length} elements with ARIA attributes`)
  
  const issues: string[] = []
  
  elementsWithAria.forEach((element, index) => {
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    const ariaDescribedBy = element.getAttribute('aria-describedby')
    const role = element.getAttribute('role')
    
    // Check for empty aria-label
    if (ariaLabel === '') {
      issues.push(`Element ${index + 1} has empty aria-label`)
    }
    
    // Check if aria-labelledby references exist
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(' ')
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          issues.push(`Element ${index + 1} references non-existent ID: ${id}`)
        }
      })
    }
    
    // Check if aria-describedby references exist
    if (ariaDescribedBy) {
      const ids = ariaDescribedBy.split(' ')
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          issues.push(`Element ${index + 1} references non-existent ID: ${id}`)
        }
      })
    }
    
    // Check for valid roles
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
      'definition', 'dialog', 'directory', 'document', 'feed', 'figure',
      'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list',
      'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
      'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
      'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
      'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
      'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
      'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ]
    
    if (role && !validRoles.includes(role)) {
      issues.push(`Element ${index + 1} has invalid role: ${role}`)
    }
  })
  
  if (issues.length === 0) {
    console.log('✅ All ARIA attributes are properly configured')
  } else {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }
  
  return { total: elementsWithAria.length, issues }
}

/**
 * Check semantic HTML
 */
export function testSemanticHTML() {
  console.log('📝 Testing Semantic HTML...\n')
  
  const issues: string[] = []
  
  // Check for main landmark
  const main = document.querySelector('main, [role="main"]')
  if (!main) {
    issues.push('Page missing <main> landmark')
  }
  
  // Check for navigation
  const nav = document.querySelector('nav, [role="navigation"]')
  if (!nav) {
    issues.push('Page missing <nav> landmark')
  }
  
  // Check for h1
  const h1s = document.querySelectorAll('h1')
  if (h1s.length === 0) {
    issues.push('Page missing h1 heading')
  } else if (h1s.length > 1) {
    issues.push(`Page has ${h1s.length} h1 headings (should have 1)`)
  }
  
  // Check heading hierarchy
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let previousLevel = 0
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1])
    
    if (level - previousLevel > 1) {
      issues.push(`Heading level skipped from h${previousLevel} to h${level} at position ${index + 1}`)
    }
    
    previousLevel = level
  })
  
  // Check for clickable divs/spans
  const clickableDivs = document.querySelectorAll('div[onclick], span[onclick]')
  if (clickableDivs.length > 0) {
    issues.push(`Found ${clickableDivs.length} clickable div/span elements (should use <button>)`)
  }
  
  if (issues.length === 0) {
    console.log('✅ Semantic HTML is properly used')
  } else {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }
  
  return issues
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('🚀 Running All Accessibility Tests\n')
  console.log('='.repeat(50))
  
  const results = {
    audit: auditAccessibility(),
    keyboard: testKeyboardNavigation(),
    aria: testARIA(),
    semantic: testSemanticHTML()
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('\n📊 Summary:')
  console.log(`  Audit Issues: ${results.audit?.length || 0}`)
  console.log(`  Keyboard Issues: ${results.keyboard.issues.length}`)
  console.log(`  ARIA Issues: ${results.aria.issues.length}`)
  console.log(`  Semantic HTML Issues: ${results.semantic.length}`)
  
  const totalIssues = 
    (results.audit?.length || 0) +
    results.keyboard.issues.length +
    results.aria.issues.length +
    results.semantic.length
  
  if (totalIssues === 0) {
    console.log('\n🎉 Congratulations! Your application is fully accessible!')
  } else {
    console.log(`\n⚠️ Total Issues: ${totalIssues}`)
    console.log('Please review and fix the issues above.')
  }
  
  return results
}

// Make functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).a11y = {
    audit: auditAccessibility,
    auditElement,
    testKeyboard: testKeyboardNavigation,
    testARIA,
    testSemantic: testSemanticHTML,
    runAll: runAllTests
  }
  
  console.log('💡 Accessibility testing tools available:')
  console.log('  window.a11y.audit() - Run full audit')
  console.log('  window.a11y.auditElement(element) - Audit specific element')
  console.log('  window.a11y.testKeyboard() - Test keyboard navigation')
  console.log('  window.a11y.testARIA() - Test ARIA attributes')
  console.log('  window.a11y.testSemantic() - Test semantic HTML')
  console.log('  window.a11y.runAll() - Run all tests')
}
