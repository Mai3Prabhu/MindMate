'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Palette,
  Bell,
  Download,
  Trash2,
  Save,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import useSWR from 'swr'
import { useTheme } from 'next-themes'

interface UserProfile {
  id: string
  name: string
  display_name: string | null
  email: string
  age: number | null
  gender: string | null
  phone: string | null
  place: string | null
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  therapy_reminders: boolean
  journal_reminders: boolean
  wellness_tips: boolean
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token')
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'notifications' | 'data'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { theme, setTheme } = useTheme()

  const { data: profile, mutate: mutateProfile } = useSWR<UserProfile>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
    fetcher
  )

  const { data: notifications, mutate: mutateNotifications } = useSWR<NotificationSettings>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/settings/notifications`,
    fetcher
  )

  const [profileForm, setProfileForm] = useState({
    name: '',
    display_name: '',
    age: '',
    gender: '',
    phone: '',
    place: '',
  })

  const [notificationForm, setNotificationForm] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    therapy_reminders: true,
    journal_reminders: true,
    wellness_tips: true,
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        display_name: profile.display_name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        phone: profile.phone || '',
        place: profile.place || '',
      })
    }
  }, [profile])

  // Update notification form when data loads
  useEffect(() => {
    if (notifications) {
      setNotificationForm(notifications)
    }
  }, [notifications])

  const showSaveMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            ...profileForm,
            age: profileForm.age ? parseInt(profileForm.age) : null,
          }),
        }
      )

      if (response.ok) {
        mutateProfile()
        showSaveMessage('success', 'Profile updated successfully!')
      } else {
        const error = await response.json()
        showSaveMessage('error', error.detail || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      showSaveMessage('error', 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTheme = async (newTheme: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/settings/theme`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ theme: newTheme }),
        }
      )

      if (response.ok) {
        setTheme(newTheme)
        showSaveMessage('success', 'Theme updated successfully!')
      } else {
        showSaveMessage('error', 'Failed to update theme')
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      showSaveMessage('error', 'An error occurred while saving theme')
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/settings/notifications`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(notificationForm),
        }
      )

      if (response.ok) {
        mutateNotifications()
        showSaveMessage('success', 'Notification settings updated!')
      } else {
        showSaveMessage('error', 'Failed to update notification settings')
      }
    } catch (error) {
      console.error('Error saving notifications:', error)
      showSaveMessage('error', 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/data/export`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      )

      if (response.ok) {
        const data = await response.json()
        
        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mindmate-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        showSaveMessage('success', 'Data exported successfully!')
      } else {
        showSaveMessage('error', 'Failed to export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      showSaveMessage('error', 'An error occurred during export')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showSaveMessage('error', 'Please type DELETE to confirm')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/account`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      )

      if (response.ok) {
        // Clear local storage and redirect to home
        localStorage.removeItem('access_token')
        window.location.href = '/'
      } else {
        showSaveMessage('error', 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      showSaveMessage('error', 'An error occurred during deletion')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ]

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and data
            </p>
          </motion.div>

          {/* Save Message */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                saveMessage.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {saveMessage.type === 'success' ? <Check size={20} /> : <X size={20} />}
              {saveMessage.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Profile Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.display_name}
                          onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          value={profileForm.age}
                          onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gender
                        </label>
                        <input
                          type="text"
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileForm.place}
                          onChange={(e) => setProfileForm({ ...profileForm, place: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Save size={20} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Theme Tab */}
                {activeTab === 'theme' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Theme Preferences
                    </h2>
                    
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Choose your preferred color theme for the application
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['light', 'dark', 'system'].map((themeOption) => (
                          <button
                            key={themeOption}
                            onClick={() => handleSaveTheme(themeOption)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              theme === themeOption
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                themeOption === 'light' ? 'bg-yellow-400' :
                                themeOption === 'dark' ? 'bg-gray-800' :
                                'bg-gradient-to-br from-yellow-400 to-gray-800'
                              }`}>
                                <Palette className="text-white" size={32} />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {themeOption}
                              </span>
                              {theme === themeOption && (
                                <Check className="text-purple-600" size={20} />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Notification Settings
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'email_notifications', label: 'Email Notifications', description: 'Receive updates via email' },
                        { key: 'push_notifications', label: 'Push Notifications', description: 'Receive browser notifications' },
                        { key: 'therapy_reminders', label: 'Therapy Reminders', description: 'Get reminded about therapy sessions' },
                        { key: 'journal_reminders', label: 'Journal Reminders', description: 'Daily reminders to journal' },
                        { key: 'wellness_tips', label: 'Wellness Tips', description: 'Receive wellness tips and insights' },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {setting.label}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {setting.description}
                            </p>
                          </div>
                          <button
                            onClick={() => setNotificationForm({
                              ...notificationForm,
                              [setting.key]: !notificationForm[setting.key as keyof NotificationSettings]
                            })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              notificationForm[setting.key as keyof NotificationSettings]
                                ? 'bg-purple-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                                notificationForm[setting.key as keyof NotificationSettings]
                                  ? 'translate-x-6'
                                  : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Save size={20} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Data & Privacy Tab */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Data & Privacy
                    </h2>
                    
                    {/* Export Data */}
                    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Download className="text-blue-600 dark:text-blue-300" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Export Your Data
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Download all your personal data in JSON format. This includes your profile, 
                            therapy sessions, journal entries, and all other data.
                          </p>
                          <button
                            onClick={handleExportData}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <Download size={18} />
                            Export Data
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                          <AlertTriangle className="text-red-600 dark:text-red-300" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Delete Account
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          
                          {!showDeleteConfirm ? (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <Trash2 size={18} />
                              Delete Account
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Type <span className="font-bold">DELETE</span> to confirm
                                </label>
                                <input
                                  type="text"
                                  value={deleteConfirmText}
                                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                                  placeholder="DELETE"
                                />
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={handleDeleteAccount}
                                  disabled={deleteConfirmText !== 'DELETE'}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={18} />
                                  Confirm Delete
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeleteConfirmText('')
                                  }}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
