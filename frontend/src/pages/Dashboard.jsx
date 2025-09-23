import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Heart, 
  Play,
  Pause,
  MoreHorizontal,
  Brain,
  Zap
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiStatus, setAiStatus] = useState({ active: true, agents: 2 })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load quick recommendations
      const recResponse = await api.get('/recommendations/quick?limit=6')
      setRecommendations(recResponse.data)

      // Load trending podcasts
      const trendingResponse = await api.get('/recommendations/trending?limit=4')
      setTrending(trendingResponse.data)

      // Load recent activity
      const activityResponse = await api.get('/recommendations/history?limit=5')
      setRecentActivity(activityResponse.data)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPodcast = (podcast) => {
    // This would integrate with a podcast player
    toast.success(`Playing: ${podcast.title}`)
  }

  const handleAddToFavorites = async (podcastId) => {
    try {
      await api.post(`/podcasts/${podcastId}/favorite`)
      toast.success('Added to favorites')
    } catch (error) {
      toast.error('Failed to add to favorites')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-primary-100">
              Discover your next favorite podcast with AI-powered recommendations
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">AI Active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recommendations</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Agents</p>
              <p className="text-2xl font-bold text-gray-900">{aiStatus.agents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">95%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((podcast, index) => (
                <motion.div
                  key={podcast.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{podcast.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{podcast.author}</p>
                      <p className="text-xs text-gray-500 mt-1">{podcast.category}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePlayPodcast(podcast)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAddToFavorites(podcast.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Trending</h3>
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div className="space-y-3">
              {trending.map((podcast, index) => (
                <div key={podcast.id || index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{podcast.title}</p>
                    <p className="text-xs text-gray-500">{podcast.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.recommendations_count} recommendations generated
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
