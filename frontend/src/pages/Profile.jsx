import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Settings, 
  Save, 
  Edit3,
  Brain,
  BarChart3,
  Clock,
  Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    full_name: ''
  })
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    averageConfidence: 0,
    mostUsedAgent: 'unknown',
    recentActivity: 0
  })

  useEffect(() => {
    loadUserInfo()
    loadUserStats()
  }, [])

  const loadUserInfo = async () => {
    try {
      const response = await api.get('/me')
      setUserInfo(response.data)
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  const loadUserStats = async () => {
    try {
      const response = await api.get('/recommendations/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await api.put('/me', userInfo)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600">Your account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={userInfo.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={userInfo.full_name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          </div>

          {/* AI Preferences */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Preferences</h2>
                <p className="text-sm text-gray-600">Customize your AI experience</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">AI Recommendations</h3>
                  <p className="text-sm text-gray-600">Use AI-powered recommendations</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">NLP Analysis</h3>
                  <p className="text-sm text-gray-600">Analyze content for better recommendations</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Learning Mode</h3>
                  <p className="text-sm text-gray-600">Learn from your listening habits</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Your Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recommendations</span>
                <span className="font-medium text-gray-900">{stats.totalRecommendations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confidence</span>
                <span className="font-medium text-gray-900">{stats.averageConfidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Agent</span>
                <span className="font-medium text-gray-900 capitalize">{stats.mostUsedAgent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Activity</span>
                <span className="font-medium text-gray-900">{stats.recentActivity}</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn btn-outline text-left justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button className="w-full btn btn-outline text-left justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Activity History
              </button>
              <button className="w-full btn btn-outline text-left justify-start">
                <Star className="h-4 w-4 mr-2" />
                Preferences
              </button>
              <button
                onClick={handleLogout}
                className="w-full btn btn-secondary text-left justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* AI Status */}
          <div className="card p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">AI System Active</span>
            </div>
            <p className="text-xs text-green-600">
              Multi-agent system running with 2 active agents
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
