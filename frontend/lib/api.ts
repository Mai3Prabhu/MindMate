/**
 * API Client for MindMate
 * Handles all API requests with authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(message: string, public statusCode: number, public details?: any) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Always send cookies
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new APIError(
        error.message || error.detail || 'Request failed',
        response.status,
        error
      );
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response as any;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error. Please check your connection.', 0);
  }
}

// Journal API
export const journalAPI = {
  async checkPIN() {
    return fetchAPI<{ has_pin: boolean }>('/api/journal/check-pin');
  },
  
  async setPIN(pin: string) {
    return fetchAPI<{ message: string }>('/api/journal/set-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },
  
  async validatePIN(pinHash: string) {
    return fetchAPI<{ valid: boolean; pin_set: boolean }>('/api/journal/validate-pin', {
      method: 'POST',
      body: JSON.stringify({ pin_hash: pinHash }),
    });
  },
  
  async getEntries(limit: number = 50, offset: number = 0) {
    return fetchAPI<Array<{
      id: string;
      content: string;
      mood_tag?: string;
      theme: string;
      timestamp: string;
    }>>(`/api/journal?limit=${limit}&offset=${offset}`);
  },
  
  async createEntry(data: { content: string; mood_tag?: string; theme?: string }) {
    return fetchAPI<{
      id: string;
      content: string;
      mood_tag?: string;
      theme: string;
      timestamp: string;
    }>('/api/journal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updateEntry(id: string, data: { content?: string; mood_tag?: string; theme?: string }) {
    return fetchAPI<{
      id: string;
      content: string;
      mood_tag?: string;
      theme: string;
      timestamp: string;
    }>(`/api/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async deleteEntry(id: string) {
    return fetchAPI<{ message: string }>(`/api/journal/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getStreaks() {
    return fetchAPI<{
      current_streak: number;
      longest_streak: number;
      total_entries: number;
      entries_by_date: Record<string, number>;
    }>('/api/journal/streaks');
  },
};

// FeelHear API
export const feelHearAPI = {
  async analyzeAudio(audioBase64: string, durationSeconds: number) {
    return fetchAPI<{
      session_id: string;
      emotion: string;
      intensity: number;
      secondary_emotions: string[];
      message: string;
      transcription?: string;
    }>('/api/feelhear/analyze', {
      method: 'POST',
      body: JSON.stringify({
        audio_base64: audioBase64,
        duration_seconds: durationSeconds,
      }),
    });
  },
  
  async saveSession(sessionId: string) {
    return fetchAPI<{ message: string }>('/api/feelhear/save', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },
  
  async getHistory(limit: number = 10, savedOnly: boolean = false) {
    return fetchAPI<Array<{
      id: string;
      analyzed_emotion: string;
      intensity: number;
      summary: string;
      timestamp: string;
      saved: boolean;
    }>>(`/api/feelhear/history?limit=${limit}&saved_only=${savedOnly}`);
  },
  
  async deleteSession(sessionId: string) {
    return fetchAPI<{ message: string }>(`/api/feelhear/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

// FeelFlow API
export const feelFlowAPI = {
  async logMood(data: { label: string; intensity: number; snippet?: string }) {
    return fetchAPI<{
      id: string;
      label: string;
      intensity: number;
      source: string;
      timestamp: string;
      snippet?: string;
    }>('/api/feelflow/mood', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getHistory(days: number = 30, startDate?: string, endDate?: string) {
    let url = `/api/feelflow/history?days=${days}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    return fetchAPI<Array<{
      id: string;
      label: string;
      intensity: number;
      source: string;
      timestamp: string;
      snippet?: string;
    }>>(url);
  },
  
  async getInsights(days: number = 30) {
    return fetchAPI<{
      insights: string;
      dominant_emotions: Array<{ emotion: string; count: number; avg_intensity: number }>;
      patterns: string[];
      suggestions: string[];
    }>('/api/feelflow/insights', {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },
  
  async exportHistory(format: 'txt' | 'json', days: number = 30) {
    const response = await fetch(`${API_URL}/api/feelflow/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ format, days }),
    });
    
    if (!response.ok) {
      throw new APIError('Export failed', response.status);
    }
    
    if (format === 'txt') {
      const blob = await response.blob();
      return blob;
    }
    
    return await response.json();
  },
  
  async deleteMood(moodId: string) {
    return fetchAPI<{ message: string }>(`/api/feelflow/${moodId}`, {
      method: 'DELETE',
    });
  },
};

// Brain Gym API
export const brainGymAPI = {
  async getGames() {
    return fetchAPI<{
      games: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
      }>;
    }>('/api/braingym/games');
  },
  
  async submitScore(gameType: string, score: number) {
    return fetchAPI<{
      id: string;
      game_type: string;
      score: number;
      timestamp: string;
    }>('/api/braingym/score', {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType, score }),
    });
  },
  
  async getScores(gameType?: string, limit: number = 50) {
    let url = `/api/braingym/scores?limit=${limit}`;
    if (gameType) url += `&game_type=${gameType}`;
    
    return fetchAPI<Array<{
      id: string;
      game_type: string;
      score: number;
      timestamp: string;
    }>>(url);
  },
  
  async getTrends(gameType: string, days: number = 30) {
    return fetchAPI<{
      game_type: string;
      scores: Array<{ score: number; timestamp: string }>;
      average_score: number;
      best_score: number;
      total_plays: number;
      ai_insight: string;
    }>(`/api/braingym/trends/${gameType}?days=${days}`);
  },
};

// Therapy API
export const therapyAPI = {
  async sendMessage(data: { session_id?: string; message: string; mode?: string }) {
    return fetchAPI<{
      session_id: string;
      response: string;
      topics: string[];
      crisis_detected: boolean;
      crisis_message?: string;
    }>('/api/therapy/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getHistory(limit: number = 5) {
    return fetchAPI<Array<{
      id: string;
      mode: string;
      started_at: string;
      ended_at?: string;
      topics: string[];
      feeling_rating?: number;
      key_insights?: string;
      message_count: number;
    }>>(`/api/therapy/history?limit=${limit}`);
  },
  
  async closeSession(session_id: string, feeling_rating?: number) {
    return fetchAPI<{
      message: string;
      reflection: string;
    }>('/api/therapy/close', {
      method: 'POST',
      body: JSON.stringify({ session_id, feeling_rating }),
    });
  },
  
  async exportSession(session_id: string, format: 'txt' | 'pdf') {
    const response = await fetch(`${API_URL}/api/therapy/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ session_id, format }),
    });
    
    if (!response.ok) {
      throw new APIError('Export failed', response.status);
    }
    
    if (format === 'txt') {
      const blob = await response.blob();
      return blob;
    }
    
    return await response.json();
  },
};

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetchAPI<{
      message: string;
      user: {
        id: string;
        email: string;
        name?: string;
      };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important: send cookies
    });
    
    return response;
  },
  
  async register(data: { name: string; username: string; email: string; password: string; user_type: string }) {
    const response = await fetchAPI<{
      message: string;
      user: {
        id: string;
        email: string;
        name: string;
      };
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return response;
  },
  
  async logout() {
    const response = await fetchAPI<{ message: string }>('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    return response;
  },
  
  async validate() {
    return fetchAPI<{ valid: boolean; user: any }>('/api/auth/validate', {
      credentials: 'include',
    });
  },
};

export { APIError };
