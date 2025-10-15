import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

interface AdminLoginData {
  username: string
  password: string
}

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
  user_preferences_used?: {
    search_queries?: string[]
    days_analyzed?: number
    query_frequency?: Record<string, number>
  }
}

interface AdminDashboardProps {
  onClose: () => void
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState<AdminLoginData>({ username: '', password: '' })
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
    // Check if admin is already authenticated
    const token = localStorage.getItem('admin_token')
    if (token) {
      setIsAuthenticated(true)
      loadDashboardData()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      localStorage.setItem('admin_token', data.access_token)
      setIsAuthenticated(true)
      loadDashboardData()
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setStats(null)
    setRecommendations([])
  }

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
      setRecommendations(data.recommendations)
      setTotalCount(data.total_count)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations')
    }
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

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <img 
              src="/logo.png" 
              alt="Podify Admin" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Default Credentials:</h3>
            <p className="text-sm text-gray-600">Username: <code className="bg-gray-200 px-1 rounded">admin</code></p>
            <p className="text-sm text-gray-600">Password: <code className="bg-gray-200 px-1 rounded">admin123</code></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Podify Admin" 
                className="h-10 w-auto"
              />
              <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Filters
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Logout
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Stats Section */}
            {stats && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
                    <div className="text-sm text-blue-600">Total Users</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.total_recommendations}</div>
                    <div className="text-sm text-green-600">Total Recommendations</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.recommendations_today}</div>
                    <div className="text-sm text-yellow-600">Today's Recommendations</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(stats.recommendation_sources).length}
                    </div>
                    <div className="text-sm text-purple-600">Sources</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
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
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Table */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All User Recommendations</h3>
                <div className="text-sm text-gray-600">
                  Showing {recommendations.length} of {totalCount} recommendations
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3 text-gray-600">Loading recommendations...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Podcast
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recommendations.map((rec) => (
                        <tr key={rec.recommendation_id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {rec.user_name || rec.user_email || rec.user_id}
                              </div>
                              <div className="text-sm text-gray-500">{rec.user_id}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              {rec.podcast_thumbnail && (
                                <img 
                                  src={rec.podcast_thumbnail} 
                                  alt={rec.podcast_title}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {rec.podcast_title}
                                </div>
                                {rec.podcast_duration && (
                                  <div className="text-sm text-gray-500">
                                    {formatDuration(rec.podcast_duration)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              <div className="line-clamp-2 mb-1">
                                {rec.recommendation_reason}
                              </div>
                              {rec.user_preferences_used && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <div className="font-medium">Search History:</div>
                                  <div className="line-clamp-1">
                                    {rec.user_preferences_used.search_queries?.slice(0, 2).join(', ')}
                                    {rec.user_preferences_used.search_queries?.length > 2 && '...'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {rec.confidence_score && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(rec.confidence_score)}`}>
                                {(rec.confidence_score * 100).toFixed(0)}%
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {rec.podcast_source || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(rec.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {recommendations.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">No recommendations found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadRecommendations(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadRecommendations(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

