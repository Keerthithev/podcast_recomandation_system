import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Filter, 
  RefreshCw, 
  Play, 
  Heart, 
  MoreHorizontal,
  Brain,
  Clock,
  Star
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    categories: [],
    limit: 10,
    useAI: true
  })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])

  useEffect(() => {
    loadCategories()
    generateRecommendations()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.get('/podcasts/categories')
      setAvailableCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const generateRecommendations = async () => {
    try {
      setIsLoading(true)
      const response = await api.post('/recommendations/generate', {
        user_id: 'current_user', // This would come from auth store
        limit: filters.limit,
        categories: selectedCategories.length > 0 ? selectedCategories : null,
        exclude_listened: true,
        use_ai: filters.useAI
      })
      setRecommendations(response.data.recommendations || [])
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Failed to generate recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handlePlayPodcast = (podcast) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600">Discover podcasts tailored to your interests</p>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="btn btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategories.includes(category.name)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="useAI"
              checked={filters.useAI}
              onChange={(e) => setFilters({ ...filters, useAI: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="useAI" className="text-sm font-medium text-gray-700">
              Use AI-powered recommendations
            </label>
            <Brain className="h-4 w-4 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((podcast, index) => (
              <motion.div
                key={podcast.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
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

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{podcast.title}</h3>
                  <p className="text-sm text-gray-600">{podcast.author}</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      {podcast.category}
                    </span>
                    {podcast.average_rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{podcast.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3">{podcast.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{podcast.total_episodes} episodes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Brain className="h-3 w-3" />
                      <span>AI Recommended</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">Generate your first AI-powered recommendations</p>
            <button
              onClick={generateRecommendations}
              className="btn btn-primary"
            >
              Get Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Recommendations
