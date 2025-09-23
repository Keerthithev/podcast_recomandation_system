import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/login', { email, password })
          const { access_token, user_id, email: userEmail, username } = response.data
          
          set({
            user: { id: user_id, email: userEmail, username },
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false
          })
          return { success: false, error: errorMessage }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/register', userData)
          const { access_token, user_id } = response.data
          
          set({
            user: { id: user_id, email: userData.email, username: userData.username },
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false
          })
          return { success: false, error: errorMessage }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
        
        // Remove token from API client
        delete api.defaults.headers.common['Authorization']
      },

      clearError: () => set({ error: null }),

      initializeAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ isAuthenticated: true })
        }
        set({ isLoading: false })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

