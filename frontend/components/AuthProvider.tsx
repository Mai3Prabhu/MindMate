'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authAPI } from '@/lib/api'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has active session
    const checkAuth = async () => {
      try {
        const response = await authAPI.validate()
        if (response.valid && response.user) {
          setUser(response.user)
        }
      } catch (error) {
        // Not logged in, that's okay
        console.log('No active session')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    setUser(response.user)
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
