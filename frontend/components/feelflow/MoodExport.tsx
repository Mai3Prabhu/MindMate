'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileJson, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { feelFlowAPI } from '@/lib/api'

interface MoodExportProps {
  onClose?: () => void
}

export default function MoodExport({ onClose }: MoodExportProps) {
  const [format, setFormat] = useState<'txt' | 'json'>('txt')
  const [days, setDays] = useState(30)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportStatus('idle')
      setErrorMessage('')

      if (format === 'txt') {
        const blob = await feelFlowAPI.exportHistory('txt', days)
        
        // Create download link
        const url = window.URL.createObjectURL(blob as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mood_history_${days}days.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setExportStatus('success')
        setTimeout(() => {
          onClose?.()
        }, 2000)
      } else {
        const data = await feelFlowAPI.exportHistory('json', days)
        
        // Create JSON download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mood_history_${days}days.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setExportStatus('success')
        setTimeout(() => {
          onClose?.()
        }, 2000)
      }
    } catch (error) {
      console.error('Export error:', error)
      setErrorMessage('Failed to export mood history. Please try again.')
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-heading font-bold mb-4">Export Mood History</h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Download your mood tracking data for your personal records.
        </p>

        {/* Format Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium block mb-2">Select Format</label>
          
          <button
            onClick={() => setFormat('txt')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              format === 'txt'
                ? 'border-brand bg-brand/5'
                : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
            }`}
          >
            <FileText className={`w-5 h-5 ${format === 'txt' ? 'text-brand' : 'text-gray-400'}`} />
            <div className="flex-1 text-left">
              <div className="font-medium">Plain Text (.txt)</div>
              <div className="text-xs text-gray-500">Simple text format, easy to read</div>
            </div>
            {format === 'txt' && <CheckCircle className="w-5 h-5 text-brand" />}
          </button>

          <button
            onClick={() => setFormat('json')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              format === 'json'
                ? 'border-brand bg-brand/5'
                : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
            }`}
          >
            <FileJson className={`w-5 h-5 ${format === 'json' ? 'text-brand' : 'text-gray-400'}`} />
            <div className="flex-1 text-left">
              <div className="font-medium">JSON (.json)</div>
              <div className="text-xs text-gray-500">Structured data format</div>
            </div>
            {format === 'json' && <CheckCircle className="w-5 h-5 text-brand" />}
          </button>
        </div>

        {/* Days Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-2">Time Period</label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  days === d
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 dark:bg-dark-deep text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {exportStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Mood history exported successfully!
            </span>
          </motion.div>
        )}

        {exportStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
          >
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark-deep transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || exportStatus === 'success'}
            className="flex-1 px-4 py-2 bg-brand text-white rounded-xl font-medium hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
