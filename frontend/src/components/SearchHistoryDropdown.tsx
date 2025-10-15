import React, { useState, useEffect } from 'react'
import { userService, SearchHistoryItem } from '../services/userService'

interface SearchHistoryDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  userId: string
  className?: string
}

export default function SearchHistoryDropdown({ 
  isOpen, 
  onClose, 
  onSearch, 
  userId, 
  className = "" 
}: SearchHistoryDropdownProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      loadSearchHistory()
    }
  }, [isOpen, userId])

  const loadSearchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getSearchHistory(userId)
      // Extract search_history array from response
      const history = response.search_history || []
      // Sort by timestamp (most recent first) and limit to 10 items
      const sortedHistory = history
        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
        .slice(0, 10)
      setSearchHistory(sortedHistory)
    } catch (err: any) {
      console.error('Error loading search history:', err)
      // Handle different types of errors
      if (err.message.includes('404')) {
        setError('No search history found')
      } else if (err.message.includes('401') || err.message.includes('403')) {
        setError('Please log in to view search history')
      } else {
        setError(err.message || 'Failed to load search history')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearchClick = (query: string) => {
    onSearch(query)
    onClose()
  }

  const clearHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      await userService.clearSearchHistory(userId)
      setSearchHistory([])
    } catch (err: any) {
      setError(err.message || 'Failed to clear search history')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className={`absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${className}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Searches</h3>
          {searchHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <p className="text-xs text-gray-500 mt-2">Loading...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        ) : searchHistory.length === 0 ? (
          <div className="p-4 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-xs text-gray-500">No recent searches</p>
              <p className="text-xs text-gray-400 mt-1">Start searching to see your history here</p>
            </div>
          </div>
        ) : (
          <div className="py-1">
            {searchHistory.map((item, index) => (
              <button
                key={item.search_id || index}
                onClick={() => handleSearchClick(item.query)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{item.query}</span>
                </div>
                <div className="flex items-center ml-2 flex-shrink-0">
                  {item.results_count && (
                    <span className="text-xs text-gray-500 mr-2">
                      {item.results_count} results
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {item.timestamp ? formatTime(item.timestamp) : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Click on any search to repeat it
        </p>
      </div>
    </div>
  )
}
