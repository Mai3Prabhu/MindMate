'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

export default function AuthDebug() {
  const { user, isAuthenticated } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('auth_token'))
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Status:</span>{' '}
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">User:</span>{' '}
          {user ? user.email || user.id : 'None'}
        </div>
        <div>
          <span className="text-gray-400">Token:</span>{' '}
          {token ? (
            <span className="text-green-400">✓ Present ({token.substring(0, 20)}...)</span>
          ) : (
            <span className="text-red-400">✗ Missing</span>
          )}
        </div>
      </div>
      {!isAuthenticated && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <a href="/auth/login" className="text-blue-400 hover:underline">
            → Go to Login
          </a>
        </div>
      )}
    </div>
  )
}
