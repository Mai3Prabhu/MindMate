'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { therapyAPI } from '@/lib/api'

interface SessionExportProps {
  sessionId: string
  onClose?: () => void
}

export default function SessionExport({ sessionId, onClose }: SessionExportProps) {
  const [format, setFormat] = useState<'txt' | 'pdf'>('txt')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportStatus('idle')
      setErrorMessage('')

      if (format === 'txt') {
        const blob = await therapyAPI.exportSession(sessionId, 'txt')
        
        // Create download link
        const url = window.URL.createObjectURL(blob as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `therapy_session_${sessionId}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setExportStatus('success')
        setTimeout(() => {
          onClose?.()
        }, 2000)
      } else {
        // PDF export
        const result = await therapyAPI.exportSession(sessionId, 'pdf')
        setErrorMessage('PDF export is not yet implemented. Please use TXT format.')
        setExportStatus('error')
      }
    } catch (error) {
      console.error('Export error:', error)
      setErrorMessage('Failed to export session. Please try again.')
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
        <h2 className="text-2xl font-heading font-bold mb-4">Export Session</h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Download your therapy session for your personal records.
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
              <div className="text-xs text-gray-500">Simple text format, works everywhere</div>
            </div>
            {format === 'txt' && <CheckCircle className="w-5 h-5 text-brand" />}
          </button>

          <button
            onClick={() => setFormat('pdf')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              format === 'pdf'
                ? 'border-brand bg-brand/5'
                : 'border-gray-200 dark:border-dark-border hover:border-brand/50'
            }`}
          >
            <FileText className={`w-5 h-5 ${format === 'pdf' ? 'text-brand' : 'text-gray-400'}`} />
            <div className="flex-1 text-left">
              <div className="font-medium">PDF Document (.pdf)</div>
              <div className="text-xs text-gray-500">Formatted document (coming soon)</div>
            </div>
            {format === 'pdf' && <CheckCircle className="w-5 h-5 text-brand" />}
          </button>
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
              Session exported successfully!
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
