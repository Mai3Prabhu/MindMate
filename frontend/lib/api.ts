// API utility functions for the application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<any> {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async register(data: {
    email: string
    password: string
    name?: string
  }): Promise<any> {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async logout(): Promise<any> {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    })
  },

  async validate(): Promise<any> {
    return apiRequest('/api/auth/validate')
  },

  async getCurrentUser(): Promise<any> {
    return apiRequest('/api/users/me')
  },
}

// Journal API
export const journalAPI = {
  async getEntries(limit = 10): Promise<any[]> {
    return apiRequest(`/api/journal/entries?limit=${limit}`)
  },

  async createEntry(entry: {
    content: string
    mood_tag?: string
    theme: string
  }): Promise<any> {
    return apiRequest('/api/journal/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
  },

  async updateEntry(id: string, entry: {
    content: string
    mood_tag?: string
    theme: string
  }): Promise<any> {
    return apiRequest(`/api/journal/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
  },

  async deleteEntry(id: string): Promise<any> {
    return apiRequest(`/api/journal/entries/${id}`, {
      method: 'DELETE',
    })
  },

  async getCalendar(year: number, month: number): Promise<any[]> {
    return apiRequest(`/api/journal/calendar?year=${year}&month=${month}`)
  },

  async getStreak(): Promise<any> {
    return apiRequest('/api/journal/streak')
  },
}

// Meditation API
export const meditationAPI = {
  async getSessions(limit = 10) {
    return apiRequest(`/api/meditation/sessions?limit=${limit}`)
  },

  async createSession(session: {
    theme: string
    voice_type: string
    duration_minutes: number
    time_of_day: string
    before_calmness?: number
  }) {
    return apiRequest('/api/meditation/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  async updateSession(id: string, update: {
    after_calmness: number
  }) {
    return apiRequest(`/api/meditation/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    })
  },

  async getStats(days = 30) {
    return apiRequest(`/api/meditation/stats?days=${days}`)
  },
}

// Focus API
export const focusAPI = {
  async createSession(session: {
    duration_minutes: number
    environment: string
    tree_stage?: string
    before_focus_level?: number
  }) {
    return apiRequest('/api/focus/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  async completeSession(id: string, completion: {
    after_focus_level: number
    tree_stage: string
    completed: boolean
  }) {
    return apiRequest(`/api/focus/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(completion),
    })
  },

  async getSessions(limit = 10) {
    return apiRequest(`/api/focus/sessions?limit=${limit}`)
  },

  async getStreak() {
    return apiRequest('/api/focus/streak')
  },

  async getStats() {
    return apiRequest('/api/focus/stats')
  },
}

// Library API
export const libraryAPI = {
  async getContent(params: {
    category?: string
    type?: string
    search?: string
    featured?: boolean
    limit?: number
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    
    return apiRequest(`/api/library/content?${searchParams}`)
  },

  async getContentItem(id: string) {
    return apiRequest(`/api/library/content/${id}`)
  },

  async updateInteraction(interaction: {
    content_id: string
    liked?: boolean
    saved?: boolean
    viewed?: boolean
    completed?: boolean
  }) {
    return apiRequest('/api/library/interactions', {
      method: 'POST',
      body: JSON.stringify(interaction),
    })
  },

  async getInteractions() {
    return apiRequest('/api/library/interactions')
  },

  async getSavedContent() {
    return apiRequest('/api/library/saved')
  },

  async getFeaturedContent(limit = 3) {
    return apiRequest(`/api/library/featured?limit=${limit}`)
  },
}

// Symphony API
export const symphonyAPI = {
  async getGlobalMood(hours = 24, limit = 100) {
    return apiRequest(`/api/symphony/global?hours=${hours}&limit=${limit}`)
  },

  async submitPost(post: {
    emotion_label: string
    short_text?: string
  }) {
    return apiRequest('/api/symphony/post', {
      method: 'POST',
      body: JSON.stringify(post),
    })
  },

  async resonate(postId: string) {
    return apiRequest('/api/symphony/resonate', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    })
  },

  async getRecentPosts(limit = 50) {
    return apiRequest(`/api/symphony/posts?limit=${limit}`)
  },
}

// Therapy API - Updated to match backend endpoints
export const therapyAPI = {
  async sendMessage(data: {
    session_id?: string
    message: string
    mode?: string
  }): Promise<any> {
    return apiRequest('/api/therapy/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async closeSession(sessionId: string, feelingRating?: number): Promise<any> {
    return apiRequest('/api/therapy/close', {
      method: 'POST',
      body: JSON.stringify({ 
        session_id: sessionId,
        feeling_rating: feelingRating 
      }),
    })
  },

  async getSessionHistory(limit = 5): Promise<any> {
    return apiRequest(`/api/therapy/history?limit=${limit}`)
  },

  async exportSession(sessionId: string, format: 'txt' | 'pdf' = 'txt'): Promise<any> {
    return apiRequest('/api/therapy/export', {
      method: 'POST',
      body: JSON.stringify({ 
        session_id: sessionId,
        format 
      }),
    })
  },
}

// FeelHear API (placeholder for future implementation)
export const feelHearAPI = {
  async analyzeVoice(audioBlob: Blob) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice.wav')
    
    return apiRequest('/api/feelhear/analyze', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  },

  async getAnalysisHistory(limit = 10) {
    return apiRequest(`/api/feelhear/history?limit=${limit}`)
  },
}

// FeelFlow API (placeholder for future implementation)
export const feelFlowAPI = {
  async getEmotionalTrends(days = 30) {
    return apiRequest(`/api/feelflow/trends?days=${days}`)
  },

  async logEmotion(emotion: {
    emotion_label: string
    intensity: number
    context?: string
  }) {
    return apiRequest('/api/feelflow/log', {
      method: 'POST',
      body: JSON.stringify(emotion),
    })
  },

  async getEmotionHistory(limit = 100) {
    return apiRequest(`/api/feelflow/history?limit=${limit}`)
  },
}

// Wellness API
export const wellnessAPI = {
  // Breathing Sessions
  async createBreathingSession(session: {
    pattern: string
    duration_minutes: number
    before_calmness: number
    after_calmness?: number
  }) {
    return apiRequest('/api/wellness/breath-sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  async logBreathingSession(session: {
    type: string
    duration_minutes: number
    cycles_completed?: number
    timestamp: string
  }) {
    return apiRequest('/api/wellness/breathing-log', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  async getBreathingSessions(limit = 10) {
    return apiRequest(`/api/wellness/breath-sessions?limit=${limit}`)
  },

  async getBreathingLogs(limit = 10) {
    return apiRequest(`/api/wellness/breathing-log?limit=${limit}`)
  },

  async getBreathingStats() {
    return apiRequest('/api/wellness/breathing/stats')
  },

  // MoveFlow Activities
  async logMoveFlowActivity(activity: {
    activity_type: string
    duration_minutes: number
    intensity: string
    calories: number
  }) {
    return apiRequest('/api/wellness/moveflow-log', {
      method: 'POST',
      body: JSON.stringify(activity),
    })
  },

  async getMoveFlowActivities(limit = 10) {
    return apiRequest(`/api/wellness/moveflow-log?limit=${limit}`)
  },

  // Activities (Legacy)
  async logActivity(activity: {
    activity_type: string
    duration_minutes: number
    intensity: string
    calories: number
  }) {
    return apiRequest('/api/wellness/activity', {
      method: 'POST',
      body: JSON.stringify(activity),
    })
  },

  async getActivities(limit = 10) {
    return apiRequest(`/api/wellness/activity/sessions?limit=${limit}`)
  },

  async getActivityStats() {
    return apiRequest('/api/wellness/activity/stats')
  },

  // Meditation
  async logMeditationSession(session: {
    duration_minutes: number
    before_calmness: number
    after_calmness?: number
    meditation_type?: string
  }) {
    return apiRequest('/api/wellness/meditation-log', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  async getMeditationSessions(limit = 10) {
    return apiRequest(`/api/wellness/meditation-log?limit=${limit}`)
  },

  // Journal
  async logJournalPrompt(journal: {
    prompt: string
    response: string
    mood_before?: number
    mood_after?: number
  }) {
    return apiRequest('/api/wellness/journal-prompt-log', {
      method: 'POST',
      body: JSON.stringify(journal),
    })
  },

  async getJournalPrompts(limit = 10) {
    return apiRequest(`/api/wellness/journal-prompt-log?limit=${limit}`)
  },

  // Goals
  async createGoal(goal: {
    title: string
    target: number
    unit: string
    category: string
  }) {
    return apiRequest('/api/wellness/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    })
  },

  async getGoals() {
    return apiRequest('/api/wellness/goals')
  },

  async updateGoal(goalId: string, update: { current: number }) {
    return apiRequest(`/api/wellness/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    })
  },

  async deleteGoal(goalId: string) {
    return apiRequest(`/api/wellness/goals/${goalId}`, {
      method: 'DELETE',
    })
  },

  // Badges
  async getBadges() {
    return apiRequest('/api/wellness/badges')
  },

  // Overall Stats
  async getWellnessStats() {
    return apiRequest('/api/wellness/stats')
  },

  // Daily Tip
  async getDailyTip() {
    return apiRequest('/api/wellness/daily-tip')
  },
}

export default {
  authAPI,
  journalAPI,
  meditationAPI,
  focusAPI,
  libraryAPI,
  symphonyAPI,
  therapyAPI,
  feelHearAPI,
  feelFlowAPI,
  wellnessAPI,
}