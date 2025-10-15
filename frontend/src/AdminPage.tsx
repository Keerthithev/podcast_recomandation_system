import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

interface AdminStats {
  total_users: number
  total_recommendations: number
  recommendations_today: number
  most_recommended_podcast?: string
  most_active_user?: string
  recommendation_sources: Record<string, number>
}

interface Recommendation {
  recommendation_id: string
  user_id: string
  user_email?: string
  user_name?: string
  podcast_id: string
  podcast_title: string
  podcast_description?: string
  podcast_thumbnail?: string
  podcast_duration?: number
  podcast_source?: string
  recommendation_reason: string
  confidence_score?: number
  created_at: string
  user_preferences_used?: any
}

interface AdminPageProps {
  onLogout: () => void
}

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterUser, setFilterUser] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const itemsPerPage = 20

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      // Load stats
      const statsResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Load recommendations
      await loadRecommendations()
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async (page = 1) => {
    try {
      const token = localStorage.getItem('admin_token')
      const offset = (page - 1) * itemsPerPage
      let url = `${API_BASE}/admin/recommendations/all?limit=${itemsPerPage}&offset=${offset}`
      
      if (filterUser) url += `&user_id=${filterUser}`
      if (filterSource) url += `&source=${filterSource}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load recommendations')
      }

      const data = await response.json()
      
      // Group recommendations by user
      const groupedRecommendations = groupRecommendationsByUser(data.recommendations)
      setRecommendations(groupedRecommendations)
      setTotalCount(data.total_count)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations')
    }
  }

  const groupRecommendationsByUser = (recommendations: Recommendation[]) => {
    const grouped: { [key: string]: { user: any, podcasts: Recommendation[] } } = {}
    
    recommendations.forEach(rec => {
      const userKey = rec.user_id
      if (!grouped[userKey]) {
        grouped[userKey] = {
          user: {
            user_id: rec.user_id,
            user_name: rec.user_name,
            user_email: rec.user_email
          },
          podcasts: []
        }
      }
      grouped[userKey].podcasts.push(rec)
    })
    
    return Object.values(grouped)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Podify Admin" 
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Filters
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-blue-600">{stats.total_users}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-green-600">{stats.total_recommendations}</div>
                <div className="text-sm text-gray-600">Total Recommendations</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-yellow-600">{stats.recommendations_today}</div>
                <div className="text-sm text-gray-600">Today's Recommendations</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(stats.recommendation_sources).length}
                </div>
                <div className="text-sm text-gray-600">Sources</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Filter by user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sources</option>
                  <option value="Spotify">Spotify</option>
                  <option value="ListenNotes">Listen Notes</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => loadRecommendations(1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All User Recommendations</h3>
              <div className="text-sm text-gray-600">
                Showing {recommendations.length} users with {totalCount} total recommendations
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading recommendations...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommended Podcasts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Recommendations
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recommendations.map((userGroup, index) => (
                    <tr key={userGroup.user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userGroup.user.user_name || userGroup.user.user_email || userGroup.user.user_id}
                          </div>
                          <div className="text-sm text-gray-500">{userGroup.user.user_id}</div>
                          {userGroup.user.user_email && (
                            <div className="text-xs text-gray-400">{userGroup.user.user_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {userGroup.podcasts.map((rec, podcastIndex) => (
                            <div key={rec.recommendation_id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              {rec.podcast_thumbnail && (
                                <img 
                                  src={rec.podcast_thumbnail} 
                                  alt={rec.podcast_title}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {rec.podcast_title}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-2">
                                    {rec.confidence_score && (
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(rec.confidence_score)}`}>
                                        {(rec.confidence_score * 100).toFixed(0)}%
                                      </span>
                                    )}
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                      {rec.podcast_source || 'Unknown'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {rec.recommendation_reason}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs text-gray-500">
                                    {rec.podcast_duration && formatDuration(rec.podcast_duration)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(rec.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {userGroup.podcasts.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          recommendations
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recommendations.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No user recommendations found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadRecommendations(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadRecommendations(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
