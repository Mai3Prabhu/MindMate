'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, AlertCircle, Phone } from 'lucide-react'
import { therapyAPI } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'therapist'
  content: string
  timestamp: Date
}

interface TherapyChatProps {
  sessionId?: string
  mode?: 'gentle' | 'conversational' | 'silent'
  onSessionCreated?: (sessionId: string) => void
}

export default function TherapyChat({ 
  sessionId: initialSessionId, 
  mode = 'conversational',
  onSessionCreated 
}: TherapyChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [crisisMessage, setCrisisMessage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await therapyAPI.sendMessage({
        session_id: sessionId,
        message: userMessage.content,
        mode,
      })

      // Update session ID if this was the first message
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id)
        onSessionCreated?.(response.session_id)
      }

      // Check for crisis
      if (response.crisis_detected) {
        setCrisisDetected(true)
        setCrisisMessage(response.crisis_message || 'Please reach out for immediate support.')
      }

      const therapistMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'therapist',
        content: response.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, therapistMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'therapist',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Therapy chat">
      {/* Crisis Alert */}
      <AnimatePresence>
        {crisisDetected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
            aria-live="assertive"
            className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                  Immediate Support Available
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                  {crisisMessage}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <a 
                    href="tel:988" 
                    className="font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    aria-label="Call crisis helpline at 988"
                  >
                    Crisis Helpline: 988 (US)
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
            role="status"
            aria-live="polite"
            aria-label="Therapist is typing"
          >
            <div className="bg-gray-100 dark:bg-dark-card rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand" aria-hidden="true" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Therapist is typing...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-dark-border pt-4">
        <div className="flex gap-2">
          <label htmlFor="therapy-message-input" className="sr-only">
            Type your message
          </label>
          <textarea
            id="therapy-message-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 resize-none rounded-xl border-2 border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 py-3 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
            rows={3}
            disabled={isLoading}
            aria-label="Message input"
            aria-describedby="message-help-text"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label={isLoading ? 'Sending message' : 'Send message'}
            aria-disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="sr-only">{isLoading ? 'Sending' : 'Send'}</span>
          </motion.button>
        </div>
        <p id="message-help-text" className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
