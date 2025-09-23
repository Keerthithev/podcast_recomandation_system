import axios from 'axios';
import { Episode, Podcast, PaginatedResponse } from '../types/podcast';

const API_URL = 'http://localhost:8000/api/v1';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    name?: string;
    photoURL?: string;
  };
}

export interface UserInteraction {
  podcastId: string;
  type: 'listen' | 'like' | 'share' | 'subscribe';
  timestamp: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const podcastService = {
  getAllPodcasts: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    language?: string;
    search?: string;
  }): Promise<any> => {
    const response = await api.get('/podcasts', { params });
    return response;
  },

  getPodcastById: async (id: string): Promise<Podcast> => {
    return api.get(`/podcasts/${id}`);
  },

  getRecommendations: async (userId: string): Promise<Podcast[]> => {
    const response = await api.get<Podcast[]>(`/users/${userId}/recommendations`);
    return response.data;
  },

  getUserPreferences: async (userId: string) => {
    return api.get(`/users/${userId}/preferences`);
  },

  recordInteraction: async (userId: string, interaction: UserInteraction) => {
    return api.post(`/users/${userId}/interact`, interaction);
  },

  getCategories: async (): Promise<string[]> => {
    return api.get('/podcasts/categories');
  },
};

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    if (response.config.url === '/auth/login' || response.config.url === '/auth/register') {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    console.log('DEBUG login called with', credentials);
    // Use email as username for login (since registration uses username, but UI uses email)
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);

    const response: TokenResponse = await api.post('/users/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Get user info after successful login
    const token = response.access_token;
    localStorage.setItem('token', token);
    console.log('DEBUG token set', token);

    // Get user profile using the token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    let userData = undefined;
    try {
      const userResponse = await api.get('/users/me');
      // Debug: log backend user object
      console.log('DEBUG /users/me response:', userResponse.data);
      const backendUser = userResponse.data;
      userData = {
        id: backendUser.id || backendUser._id || '',
        email: backendUser.email || '',
        username: backendUser.username || '',
        name: backendUser.username || '',
        photoURL: backendUser.photoURL || ''
      };
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }

    return {
      token: token,
      user: userData || {
        id: '',
        email: '',
        username: '',
        name: '',
        photoURL: ''
      }
    };
  },
  
  register: async (userData: { username: string; email: string; password: string; preferences?: string[] }): Promise<AuthResponse> => {
    const response: AuthResponse = await api.post('/users/register', userData);
    localStorage.setItem('token', response.token);
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export const profileService = {
  getProfile: async () => {
    return api.get('/profile');
  },

  updateProfile: async (data: any) => {
    return api.put('/profile', data);
  },

  getFavorites: async () => {
    return api.get('/profile/favorites');
  },

  addToFavorites: async (podcastId: string) => {
    return api.post(`/profile/favorites/${podcastId}`);
  },

  removeFromFavorites: async (podcastId: string) => {
    return api.delete(`/profile/favorites/${podcastId}`);
  }
};
