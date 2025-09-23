import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Play, 
  MoreHorizontal,
  Clock,
  Star,
  Trash2,
  ExternalLink
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/podcasts/favorites/list')
      const favoriteIds = response.data
      
      // For each favorite ID, get the podcast details
      const favoritePodcasts = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            const podcastResponse = await api.get(`/podcasts/${id}`)
            return podcastResponse.data
          } catch (error) {
            console.error(`Error loading podcast ${id}:`, error)
            return null
          }
        })
      )
      
      setFavorites(favoritePodcasts.filter(podcast => podcast !== null))
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromFavorites = async (podcastId) => {
    try {
      await api.delete(`/podcasts/${podcastId}/favorite`)
      setFavorites(prev => prev.filter(podcast => podcast.id !== podcastId))
      toast.success('Removed from favorites')
    } catch (error) {
      toast.error('Failed to remove from favorites')
    }
  }

  const handlePlayPodcast = (podcast) => {
    toast.success(`Playing: ${podcast.title}`)
  }

  const handleOpenSpotify = (podcast) => {
    if (podcast.spotify_url) {
      window.open(podcast.spotify_url, '_blank')
    } else {
      toast.error('Spotify link not available')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your saved podcasts</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Heart className="h-4 w-4 text-red-500" />
          <span>{favorites.length} favorites</span>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((podcast, index) => (
            <motion.div
              key={podcast.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white fill-current" />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePlayPodcast(podcast)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Play"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  {podcast.spotify_url && (
                    <button
                      onClick={() => handleOpenSpotify(podcast)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Open in Spotify"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveFromFavorites(podcast.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
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
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
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
                    <Heart className="h-3 w-3 text-red-500" />
                    <span>Favorited</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-4">Start adding podcasts to your favorites</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Click the heart icon on any podcast</p>
            <p>• Your favorites will appear here</p>
            <p>• Access them quickly anytime</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Favorites
