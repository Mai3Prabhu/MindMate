'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register']

  useEffect(() => {
    const checkAuth = async () => {
      // Check if current route is public
      if (publicRoutes.includes(pathname)) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('auth_token')
        
        if (!token) {
          // Not authenticated, redirect to login
          router.push('/auth/login')
          return
        }

        // Validate token with backend
        try {
          const response = await fetch('/api/auth/validate', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (!response.ok) {
            // Token is invalid, clear it and redirect
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            router.push('/auth/login')
            return
          }
        } catch (error) {
          console.error('Token validation error:', error)
          // On network error, allow access but log the error
          // In production, you might want to redirect to login
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
