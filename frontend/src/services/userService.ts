// User Management API Service

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export interface UserProfile {
  user_id: string
  username?: string
  email?: string
  full_name?: string
  bio?: string
  profile_picture?: string
  date_joined?: string
  last_active?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  user_id: string
  preferred_language?: string
  max_duration?: number
  favorite_genres: string[]
  favorite_topics: string[]
  explicit_content?: boolean
  auto_play?: boolean
  download_quality?: string
}

export interface SearchHistoryItem {
  search_id?: string
  user_id: string
  query: string
  timestamp?: string
  results_count?: number
  filters_applied?: Record<string, any>
}

export interface ListenHistoryItem {
  listen_id?: string
  user_id: string
  podcast_id: string
  episode_id?: string
  podcast_title: string
  episode_title?: string
  duration_listened?: number
  total_duration?: number
  completion_percentage?: number
  timestamp?: string
  platform?: string
}

export interface FavoriteItem {
  favorite_id?: string
  user_id: string
  item_type: 'podcast' | 'episode' | 'genre' | 'topic'
  item_id: string
  item_title: string
  item_description?: string
  item_image?: string
  date_added?: string
  tags: string[]
}

export interface ListenStats {
  total_episodes: number
  total_time_listened: number
  total_time_hours: number
  average_completion: number
}

export interface CompleteUserData {
  profile: UserProfile
  recent_searches: SearchHistoryItem[]
  recent_listens: ListenHistoryItem[]
  favorite_counts: Record<string, number>
  listening_stats: ListenStats
}

class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Profile Management
  async createProfile(profile: Omit<UserProfile, 'date_joined' | 'last_active'>): Promise<{ message: string; data: UserProfile }> {
    return this.request('/profile/create', {
      method: 'POST',
      body: JSON.stringify(profile)
    })
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return this.request(`/profile/${userId}`)
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ message: string; updated_fields: string[] }> {
    return this.request(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteProfile(userId: string): Promise<{ message: string }> {
    return this.request(`/profile/${userId}`, {
      method: 'DELETE'
    })
  }

  // Preferences Management
  async savePreferences(preferences: UserPreferences): Promise<{ message: string; data: UserPreferences }> {
    return this.request('/preferences/', {
      method: 'POST',
      body: JSON.stringify(preferences)
    })
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    return this.request(`/preferences/${userId}`)
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ message: string; data: UserPreferences }> {
    return this.request(`/preferences/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    })
  }

  async deletePreferences(userId: string): Promise<{ message: string }> {
    return this.request(`/preferences/${userId}`, {
      method: 'DELETE'
    })
  }

  // Search History
  async addSearchHistory(searchItem: Omit<SearchHistoryItem, 'search_id' | 'timestamp'>): Promise<{ message: string; search_id: string }> {
    return this.request('/history/search', {
      method: 'POST',
      body: JSON.stringify(searchItem)
    })
  }

  async getSearchHistory(userId: string, limit = 50, offset = 0): Promise<{ search_history: SearchHistoryItem[]; count: number }> {
    return this.request(`/history/search/${userId}?limit=${limit}&offset=${offset}`)
  }

  async clearSearchHistory(userId: string): Promise<{ message: string }> {
    return this.request(`/history/search/${userId}`, {
      method: 'DELETE'
    })
  }

  async deleteSearchItem(userId: string, searchId: string): Promise<{ message: string }> {
    return this.request(`/history/search/${userId}/${searchId}`, {
      method: 'DELETE'
    })
  }

  // Listen History
  async addListenHistory(listenItem: Omit<ListenHistoryItem, 'listen_id' | 'timestamp' | 'completion_percentage'>): Promise<{ message: string; listen_id: string }> {
    return this.request('/history/listen', {
      method: 'POST',
      body: JSON.stringify(listenItem)
    })
  }

  async getListenHistory(userId: string, limit = 50, offset = 0): Promise<{ listen_history: ListenHistoryItem[]; count: number }> {
    return this.request(`/history/listen/${userId}?limit=${limit}&offset=${offset}`)
  }

  async getListenStats(userId: string): Promise<ListenStats> {
    return this.request(`/history/listen/${userId}/stats`)
  }

  async clearListenHistory(userId: string): Promise<{ message: string }> {
    return this.request(`/history/listen/${userId}`, {
      method: 'DELETE'
    })
  }

  async deleteListenItem(userId: string, listenId: string): Promise<{ message: string }> {
    return this.request(`/history/listen/${userId}/${listenId}`, {
      method: 'DELETE'
    })
  }

  // Favorites Management
  async addFavorite(favoriteItem: Omit<FavoriteItem, 'favorite_id' | 'date_added'>): Promise<{ message: string; favorite_id: string }> {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify(favoriteItem)
    })
  }

  async getFavorites(userId: string, itemType?: string, limit = 50, offset = 0): Promise<{ favorites: FavoriteItem[]; count: number }> {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() })
    if (itemType) params.append('item_type', itemType)
    return this.request(`/favorites/${userId}?${params}`)
  }

  async getFavoriteTypes(userId: string): Promise<{ favorite_types: Array<{ type: string; count: number }> }> {
    return this.request(`/favorites/${userId}/types`)
  }

  async removeFavoriteById(userId: string, favoriteId: string): Promise<{ message: string }> {
    return this.request(`/favorites/${userId}/${favoriteId}`, {
      method: 'DELETE'
    })
  }

  async removeFavoriteByItem(userId: string, itemId: string, itemType: string): Promise<{ message: string }> {
    return this.request(`/favorites/${userId}/item/${itemId}?item_type=${itemType}`, {
      method: 'DELETE'
    })
  }

  async clearFavorites(userId: string, itemType?: string): Promise<{ message: string }> {
    const params = itemType ? `?item_type=${itemType}` : ''
    return this.request(`/favorites/${userId}${params}`, {
      method: 'DELETE'
    })
  }

  async checkFavoriteStatus(userId: string, itemId: string, itemType: string): Promise<{ is_favorite: boolean; favorite_id?: string }> {
    return this.request(`/favorites/${userId}/check/${itemId}?item_type=${itemType}`)
  }

  // Comprehensive Data
  async getCompleteUserData(userId: string): Promise<CompleteUserData> {
    try {
      return await this.request(`/user/${userId}/complete`)
    } catch (error: any) {
      // If user not found, try to create a basic profile first
      if (error.message.includes('User not found')) {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.id === userId) {
          try {
            await this.createProfile({
              user_id: userId,
              email: user.email,
              username: user.name || user.email?.split('@')[0],
              full_name: user.name || user.email?.split('@')[0]
            })
            // Try again after creating profile
            return await this.request(`/user/${userId}/complete`)
          } catch (createError) {
            console.warn('Failed to create user profile:', createError)
          }
        }
      }
      throw error
    }
  }

  async updateUserActivity(userId: string): Promise<{ message: string; last_active: string }> {
    return this.request(`/user/${userId}/activity`, {
      method: 'PUT'
    })
  }
}

export const userService = new UserService()
