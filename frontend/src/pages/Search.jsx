import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search as SearchIcon, 
  Filter, 
  Play, 
  Heart, 
  MoreHorizontal,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Search = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [searchHistory, setSearchHistory] = useState([])

  useEffect(() => {
    loadCategories()
    loadSearchHistory()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.get('/podcasts/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    setSearchHistory(history)
  }

  const saveSearchQuery = (query) => {
    if (query.trim()) {
      const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }
  }

  const searchPodcasts = async (searchQuery = query) => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      saveSearchQuery(searchQuery)
      
      const response = await api.get('/podcasts/search', {
        params: {
          query: searchQuery,
          category: selectedCategory || undefined,
          limit: 20
        }
      })
      
      setResults(response.data)
    } catch (error) {
      console.error('Error searching podcasts:', error)
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    searchPodcasts()
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

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Podcasts</h1>
        <p className="text-gray-600">Find your next favorite podcast using AI-powered search</p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for podcasts, topics, or hosts..."
                className="input pl-10 w-full"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-48"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !isLoading && results.length === 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
            <button
              onClick={clearSearchHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(item)
                  searchPodcasts(item)
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
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
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {results.length} results found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>AI-powered search</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((podcast, index) => (
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
                      <SearchIcon className="h-3 w-3" />
                      <span>AI Search</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : query && !isLoading ? (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
          <button
            onClick={() => setQuery('')}
            className="btn btn-primary"
          >
            Clear Search
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default Search
