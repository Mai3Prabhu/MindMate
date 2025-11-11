/**
 * Accessible Input Component
 * Includes proper labels, error states, and ARIA attributes
 */

import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  showLabel?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      showLabel = true,
      leftIcon,
      rightIcon,
      id,
      required,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    
    return (
      <div className="w-full">
        {/* Label */}
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
            !showLabel ? 'sr-only' : ''
          }`}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        
        {/* Input Container */}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2 rounded-lg border transition-colors
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || error ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500'
              }
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            aria-required={required}
            disabled={disabled}
            {...props}
          />
          
          {(rightIcon || error) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              {error ? (
                <AlertCircle size={20} className="text-red-500" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

export default AccessibleInput
