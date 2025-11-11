'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, User, UserCircle, Chrome } from 'lucide-react'
import { authAPI } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await authAPI.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        user_type: formData.userType,
      })

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      // Redirect to backend Google OAuth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`
    } catch (error) {
      console.error('Google OAuth error:', error)
      setError('Failed to initiate Google sign-in')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand/10 via-white to-accent-teal/10 dark:from-dark-deep dark:via-dark-bg dark:to-dark-card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Brain className="w-12 h-12 text-brand" />
          </div>

          <h1 className="text-3xl font-heading font-bold text-center mb-2">
            Join MindMate
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Start your wellness journey today
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium mb-2">
                I am a...
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="individual">Individual</option>
                <option value="caregiver">Caregiver / Medical Professional</option>
                <option value="family">Family Member</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-card text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5" />
            Google
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand hover:text-brand-deep font-medium">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
