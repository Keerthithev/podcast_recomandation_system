import React, { useState, useEffect } from 'react'
import { userService, FavoriteItem } from '../services/userService'

interface UserFavoritesProps {
  userId: string
  onClose: () => void
}

type FavoriteType = 'all' | 'podcast' | 'episode' | 'genre' | 'topic'

export default function UserFavorites({ userId, onClose }: UserFavoritesProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [favoriteTypes, setFavoriteTypes] = useState<Array<{ type: string; count: number }>>([])
  const [activeFilter, setActiveFilter] = useState<FavoriteType>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFavorites()
    loadFavoriteTypes()
  }, [userId])

  useEffect(() => {
    loadFavorites()
  }, [activeFilter])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      const itemType = activeFilter === 'all' ? undefined : activeFilter
      const result = await userService.getFavorites(userId, itemType, 50, 0)
      setFavorites(result.favorites)
    } catch (err: any) {
      setError(err.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const loadFavoriteTypes = async () => {
    try {
      const result = await userService.getFavoriteTypes(userId)
      setFavoriteTypes(result.favorite_types)
    } catch (err: any) {
      // Ignore error for types, not critical
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      await userService.removeFavoriteById(userId, favoriteId)
      setFavorites(prev => prev.filter(item => item.favorite_id !== favoriteId))
      // Reload types to update counts
      loadFavoriteTypes()
    } catch (err: any) {
      setError(err.message || 'Failed to remove favorite')
    }
  }

  const clearFavorites = async (type?: string) => {
    const typeText = type ? ` ${type}` : ''
    if (confirm(`Are you sure you want to clear all${typeText} favorites?`)) {
      try {
        await userService.clearFavorites(userId, type)
        loadFavorites()
        loadFavoriteTypes()
      } catch (err: any) {
        setError(err.message || 'Failed to clear favorites')
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'podcast':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      case 'episode':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10v18a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h8l4 4z" />
          </svg>
        )
      case 'genre':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      case 'topic':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'podcast': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'episode': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'genre': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'topic': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const FilterButton = ({ type, label, count }: { type: FavoriteType; label: string; count?: number }) => (
    <button
      onClick={() => setActiveFilter(type)}
      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
        activeFilter === type
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  )

  const totalCount = favoriteTypes.reduce((sum, type) => sum + type.count, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Favorites</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <FilterButton type="all" label="All" count={totalCount} />
          {favoriteTypes.map(type => (
            <FilterButton
              key={type.type}
              type={type.type as FavoriteType}
              label={type.type.charAt(0).toUpperCase() + type.type.slice(1) + 's'}
              count={type.count}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Clear All Button */}
        {favorites.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => clearFavorites(activeFilter === 'all' ? undefined : activeFilter)}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              Clear {activeFilter === 'all' ? 'All' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Favorites
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading favorites...</span>
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No favorites found</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFilter === 'all' ? 'Start adding favorites to see them here' : `No ${activeFilter} favorites yet`}
            </p>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="space-y-3">
            {favorites.map((item) => (
              <div
                key={item.favorite_id}
                className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1">
                  {/* Item Image */}
                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.item_image ? (
                      <img
                        src={item.item_image}
                        alt={item.item_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`p-2 rounded ${getTypeColor(item.item_type)}`}>
                        {getTypeIcon(item.item_type)}
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.item_title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(item.item_type)}`}>
                        {item.item_type}
                      </span>
                    </div>
                    
                    {item.item_description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {item.item_description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Added {formatDate(item.date_added)}</span>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>Tags:</span>
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-gray-400">+{item.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => item.favorite_id && removeFavorite(item.favorite_id)}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove from favorites"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && favoriteTypes.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-2">Favorites Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {favoriteTypes.map(type => (
                <div key={type.type} className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{type.count}</div>
                  <div className="text-gray-600 dark:text-gray-300 capitalize">{type.type}s</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

