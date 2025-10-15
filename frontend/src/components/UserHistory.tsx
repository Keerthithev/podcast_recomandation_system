import React, { useState, useEffect } from 'react'
import { userService, SearchHistoryItem, ListenHistoryItem, ListenStats } from '../services/userService'

interface UserHistoryProps {
  userId: string
  onClose: () => void
}

type HistoryTab = 'search' | 'listen' | 'stats'

export default function UserHistory({ userId, onClose }: UserHistoryProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>('search')
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [listenHistory, setListenHistory] = useState<ListenHistoryItem[]>([])
  const [listenStats, setListenStats] = useState<ListenStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'search') {
      loadSearchHistory()
    } else if (activeTab === 'listen') {
      loadListenHistory()
    } else if (activeTab === 'stats') {
      loadListenStats()
    }
  }, [activeTab, userId])

  const loadSearchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await userService.getSearchHistory(userId, 50, 0)
      setSearchHistory(result.search_history)
    } catch (err: any) {
      setError(err.message || 'Failed to load search history')
    } finally {
      setLoading(false)
    }
  }

  const loadListenHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await userService.getListenHistory(userId, 50, 0)
      setListenHistory(result.listen_history)
    } catch (err: any) {
      setError(err.message || 'Failed to load listen history')
    } finally {
      setLoading(false)
    }
  }

  const loadListenStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const stats = await userService.getListenStats(userId)
      setListenStats(stats)
    } catch (err: any) {
      setError(err.message || 'Failed to load listening statistics')
    } finally {
      setLoading(false)
    }
  }

  const deleteSearchItem = async (searchId: string) => {
    try {
      await userService.deleteSearchItem(userId, searchId)
      setSearchHistory(prev => prev.filter(item => item.search_id !== searchId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete search item')
    }
  }

  const deleteListenItem = async (listenId: string) => {
    try {
      await userService.deleteListenItem(userId, listenId)
      setListenHistory(prev => prev.filter(item => item.listen_id !== listenId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete listen item')
    }
  }

  const clearSearchHistory = async () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      try {
        await userService.clearSearchHistory(userId)
        setSearchHistory([])
      } catch (err: any) {
        setError(err.message || 'Failed to clear search history')
      }
    }
  }

  const clearListenHistory = async () => {
    if (confirm('Are you sure you want to clear all listen history?')) {
      try {
        await userService.clearListenHistory(userId)
        setListenHistory([])
      } catch (err: any) {
        setError(err.message || 'Failed to clear listen history')
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const TabButton = ({ id, children }: { id: HistoryTab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm rounded ${
        activeTab === id
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Activity History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b">
          <TabButton id="search">Search History</TabButton>
          <TabButton id="listen">Listen History</TabButton>
          <TabButton id="stats">Statistics</TabButton>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {/* Search History Tab */}
        {activeTab === 'search' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Search History ({searchHistory.length})</h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearSearchHistory}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  Clear All
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No search history found</p>
            ) : (
              <div className="space-y-3">
                {searchHistory.map((item) => (
                  <div
                    key={item.search_id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.query}</p>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>{formatDate(item.timestamp)}</span>
                        {item.results_count !== undefined && (
                          <span className="ml-4">{item.results_count} results</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => item.search_id && deleteSearchItem(item.search_id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listen History Tab */}
        {activeTab === 'listen' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Listen History ({listenHistory.length})</h3>
              {listenHistory.length > 0 && (
                <button
                  onClick={clearListenHistory}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  Clear All
                </button>
              )}
            </div>

            {listenHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No listen history found</p>
            ) : (
              <div className="space-y-3">
                {listenHistory.map((item) => (
                  <div
                    key={item.listen_id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.podcast_title}</h4>
                      {item.episode_title && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.episode_title}</p>
                      )}
                      <div className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
                        <span>{formatDate(item.timestamp)}</span>
                        <span>Listened: {formatDuration(item.duration_listened)}</span>
                        {item.completion_percentage !== undefined && (
                          <span>{Math.round(item.completion_percentage)}% complete</span>
                        )}
                        {item.platform && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                            {item.platform}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => item.listen_id && deleteListenItem(item.listen_id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && !loading && (
          <div>
            <h3 className="text-lg font-semibold mb-6">Listening Statistics</h3>
            
            {!listenStats ? (
              <p className="text-gray-500 text-center py-8">No listening statistics available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="text-2xl font-bold">{listenStats.total_episodes}</div>
                  <div className="text-blue-100">Episodes Listened</div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="text-2xl font-bold">{Math.round(listenStats.total_time_hours)}h</div>
                  <div className="text-green-100">Total Hours</div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                  <div className="text-2xl font-bold">{Math.round(listenStats.average_completion)}%</div>
                  <div className="text-purple-100">Avg Completion</div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                  <div className="text-2xl font-bold">
                    {listenStats.total_episodes > 0 ? Math.round(listenStats.total_time_hours / listenStats.total_episodes * 60) : 0}m
                  </div>
                  <div className="text-orange-100">Avg Episode Length</div>
                </div>
              </div>
            )}

            {listenStats && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Detailed Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Total Episodes:</strong> {listenStats.total_episodes}</p>
                    <p><strong>Total Time:</strong> {Math.round(listenStats.total_time_hours * 10) / 10} hours</p>
                  </div>
                  <div>
                    <p><strong>Average Completion:</strong> {Math.round(listenStats.average_completion * 10) / 10}%</p>
                    <p><strong>Total Minutes:</strong> {Math.round(listenStats.total_time_listened / 60)} minutes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

