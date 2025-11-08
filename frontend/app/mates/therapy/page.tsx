'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

import Navbar from '@/components/Navbar'
import { Send, Heart, Sparkles, AlertCircle, Bot, User, Loader2, Sparkle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { empatheticReply, classifyEmotion, detectCrisis } from '@/lib/gemini'

interface Message {
  role: 'user' | 'therapist'
  content: string
  timestamp: Date
  emotion?: string
  intensity?: number
  isCrisis?: boolean
}

export default function TherapyPage() {
  const { data: session } = useSession()
  const [mode, setMode] = useState<'gentle' | 'conversational' | 'silent'>('gentle')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'therapist',
      content: "Hi, I'm here with you. Take a deep breath... How are you feeling coming into this session today?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<{label: string; intensity: number} | null>(null)
  const [sessionSummary, setSessionSummary] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const modes = [
    { id: 'gentle', label: '🌸 Gentle Listener', desc: 'Warm, validating presence' },
    { id: 'conversational', label: '🌤 Conversational Coach', desc: 'Active, solution-focused' },
    { id: 'silent', label: '🌙 Silent Space', desc: 'Reflective, minimal responses' },
  ]

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const analyzeEmotion = async (text: string) => {
    try {
      const result = await classifyEmotion(text, session?.user?.accessToken || '');
      setCurrentEmotion({
        label: result.label,
        intensity: result.intensity
      });
      return result;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return null;
    }
  }

  const checkForCrisis = async (text: string) => {
    try {
      const result = await detectCrisis(text, session?.user?.accessToken || '')
      return result.detected ? result : null
    } catch (error) {
      console.error('Error checking for crisis:', error)
      return null
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      // Analyze emotion from user's message
      const emotion = await analyzeEmotion(input)
      
      // Check for crisis indicators
      const crisisCheck = await checkForCrisis(input)
      
      if (crisisCheck?.detected) {
        const crisisMessage: Message = {
          role: 'therapist',
          content: crisisCheck.message || 'I\'m concerned about what you\'re sharing. Would you like me to help you find professional support?',
          timestamp: new Date(),
          isCrisis: true
        }
        setMessages(prev => [...prev, crisisMessage])
        setIsProcessing(false)
        return
      }

      // Get empathetic response from Gemini
      const response = await empatheticReply({
        userMessage: input,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
          emotion: m.emotion
        })),
        userContext: {
          preferences: {
            mode: mode,
            emotion: emotion?.label || 'neutral'
          }
        }
      }, session?.user?.accessToken || '')

      const therapistMessage: Message = {
        role: 'therapist',
        content: response,
        timestamp: new Date(),
        emotion: emotion?.label
      }

      setMessages(prev => [...prev, therapistMessage])
    } catch (error) {
      console.error('Error in therapy session:', error)
      const errorMessage: Message = {
        role: 'therapist',
        content: 'I\'m having trouble connecting right now. Could you try again in a moment?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selector */}
        <div className="mb-6 flex flex-wrap gap-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                mode === m.id
                  ? 'bg-brand text-white shadow-lg'
                  : 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-deep'
              }`}
            >
              <div className="font-medium">{m.label}</div>
              <div className="text-xs opacity-80">{m.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 card p-6 flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70 text-inherit">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-dark-card px-4 py-3 rounded-2xl text-gray-800 dark:text-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="p-3 rounded-xl bg-brand text-white hover:bg-brand-deep focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Session Journal */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Session Notes
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Topics Discussed
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-xs">
                    Stress
                  </span>
                  <span className="px-3 py-1 bg-accent-teal/10 text-teal-600 rounded-full text-xs">
                    Work-life balance
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  How I'm feeling (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Key Insights
                </label>
                <textarea
                  className="textarea mt-2"
                  rows={4}
                  placeholder="What did I learn today?"
                ></textarea>
              </div>

              <button className="btn-primary w-full">
                Save Session
              </button>
            </div>

            {/* Safety Notice */}
            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  If you're in crisis, please reach out to a professional helpline immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
