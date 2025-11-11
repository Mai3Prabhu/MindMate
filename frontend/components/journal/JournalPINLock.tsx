'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Unlock, AlertCircle } from 'lucide-react'
import { journalAPI } from '@/lib/api'

interface JournalPINLockProps {
  onUnlock: () => void
}

async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function JournalPINLock({ onUnlock }: JournalPINLockProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [isSettingPIN, setIsSettingPIN] = useState(false)
  const [confirmPIN, setConfirmPIN] = useState(['', '', '', ''])
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasPIN, setHasPIN] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    checkPINStatus()
  }, [])

  const checkPINStatus = async () => {
    try {
      const result = await journalAPI.checkPIN()
      setHasPIN(result.has_pin)
      setIsSettingPIN(!result.has_pin)
    } catch (error) {
      console.error('Error checking PIN status:', error)
      setError('Failed to check PIN status')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePINChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newPIN = isConfirming ? [...confirmPIN] : [...pin]
    newPIN[index] = value.slice(-1)
    
    if (isConfirming) {
      setConfirmPIN(newPIN)
    } else {
      setPin(newPIN)
    }

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all digits entered
    if (index === 3 && value) {
      const fullPIN = newPIN.join('')
      if (fullPIN.length === 4) {
        if (isConfirming) {
          handleConfirmPIN(fullPIN)
        } else if (isSettingPIN) {
          handleSetPINStep(fullPIN)
        } else {
          handleValidatePIN(fullPIN)
        }
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleSetPINStep = (pinValue: string) => {
    setIsConfirming(true)
    setError('')
    setTimeout(() => inputRefs[0].current?.focus(), 100)
  }

  const handleConfirmPIN = async (confirmValue: string) => {
    const originalPIN = pin.join('')
    
    if (originalPIN !== confirmValue) {
      setError('PINs do not match. Please try again.')
      setPin(['', '', '', ''])
      setConfirmPIN(['', '', '', ''])
      setIsConfirming(false)
      setTimeout(() => inputRefs[0].current?.focus(), 100)
      return
    }

    try {
      await journalAPI.setPIN(originalPIN)
      setHasPIN(true)
      setIsSettingPIN(false)
      onUnlock()
    } catch (error) {
      console.error('Error setting PIN:', error)
      setError('Failed to set PIN. Please try again.')
      setPin(['', '', '', ''])
      setConfirmPIN(['', '', '', ''])
      setIsConfirming(false)
    }
  }

  const handleValidatePIN = async (pinValue: string) => {
    try {
      const pinHash = await hashPIN(pinValue)
      const result = await journalAPI.validatePIN(pinHash)
      
      if (result.valid) {
        onUnlock()
      } else {
        setError('Incorrect PIN. Please try again.')
        setPin(['', '', '', ''])
        setTimeout(() => inputRefs[0].current?.focus(), 100)
      }
    } catch (error) {
      console.error('Error validating PIN:', error)
      setError('Failed to validate PIN')
      setPin(['', '', '', ''])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          {isSettingPIN ? (
            <Unlock className="w-8 h-8 text-brand" />
          ) : (
            <Lock className="w-8 h-8 text-brand" />
          )}
        </motion.div>

        <h2 className="text-2xl font-heading font-bold mb-2">
          {isSettingPIN 
            ? (isConfirming ? 'Confirm Your PIN' : 'Set Your PIN')
            : 'Enter Your PIN'
          }
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          {isSettingPIN
            ? (isConfirming 
                ? 'Re-enter your 4-digit PIN to confirm'
                : 'Create a 4-digit PIN to protect your journal'
              )
            : 'Enter your 4-digit PIN to access your journal'
          }
        </p>

        {/* PIN Input */}
        <div className="flex gap-4 justify-center mb-6" role="group" aria-label="PIN entry">
          {[0, 1, 2, 3].map((index) => (
            <label key={index} className="sr-only" htmlFor={`pin-digit-${index}`}>
              PIN digit {index + 1}
            </label>
          ))}
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              id={`pin-digit-${index}`}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={isConfirming ? confirmPIN[index] : pin[index]}
              onChange={(e) => handlePINChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-dark-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              autoFocus={index === 0}
              aria-label={`PIN digit ${index + 1} of 4`}
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'pin-error' : undefined}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            id="pin-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-4"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </motion.div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isSettingPIN
            ? 'Your PIN is encrypted and stored securely'
            : 'Forgot your PIN? Contact support for assistance'
          }
        </p>
      </motion.div>
    </div>
  )
}
