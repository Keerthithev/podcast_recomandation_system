import React, { useState, useEffect } from 'react'
import { userService, CompleteUserData } from '../services/userService'
import UserProfile from './UserProfile'
import UserPreferences from './UserPreferences'
import UserHistory from './UserHistory'
import UserFavorites from './UserFavorites'

interface UserDashboardProps {
  userId: string
  onClose: () => void
  initialView?: DashboardView
}

type DashboardView = 'overview' | 'profile' | 'preferences' | 'history' | 'favorites'

export default function UserDashboard({ userId, onClose, initialView = 'overview' }: UserDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>(initialView)
  const [userData, setUserData] = useState<CompleteUserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getCompleteUserData(userId)
      setUserData(data)
    } catch (err: any) {
      console.error('Failed to load user data:', err)
      setError(err.message || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
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

  const NavButton = ({ view, icon, label }: { view: DashboardView; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeView === view
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  // Render specific views
  if (activeView === 'profile') {
    return <UserProfile userId={userId} onClose={() => setActiveView('overview')} />
  }
  if (activeView === 'preferences') {
    return <UserPreferences userId={userId} onClose={() => setActiveView('overview')} />
  }
  if (activeView === 'history') {
    return <UserHistory userId={userId} onClose={() => setActiveView('overview')} />
  }
  if (activeView === 'favorites') {
    return <UserFavorites userId={userId} onClose={() => setActiveView('overview')} />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">User Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <NavButton
            view="overview"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            label="Overview"
          />
          <NavButton
            view="profile"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            label="Profile"
          />
          <NavButton
            view="preferences"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Preferences"
          />
          <NavButton
            view="history"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="History"
          />
          <NavButton
            view="favorites"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            label="Favorites"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading dashboard...</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && userData && (
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  {userData.profile.profile_picture ? (
                    <img
                      src={userData.profile.profile_picture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {userData.profile.full_name || userData.profile.username || 'User'}
                  </h3>
                  <p className="text-indigo-100">{userData.profile.email}</p>
                  <p className="text-indigo-200 text-sm">
                    Member since {formatDate(userData.profile.date_joined)}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Episodes Listened</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {userData.listening_stats.total_episodes || 0}
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Listening Time</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatDuration(userData.listening_stats.total_time_listened)}
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Favorites</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Object.values(userData.favorite_counts).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Recent Searches</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {userData.recent_searches.length}
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Searches */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
                {userData.recent_searches.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent searches</p>
                ) : (
                  <div className="space-y-3">
                    {userData.recent_searches.slice(0, 5).map((search, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{search.query}</span>
                        <span className="text-xs text-gray-500">
                          {search.results_count} results
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Listens */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Listens</h3>
                {userData.recent_listens.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent listens</p>
                ) : (
                  <div className="space-y-3">
                    {userData.recent_listens.slice(0, 5).map((listen, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium truncate">{listen.podcast_title}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDuration(listen.duration_listened)}</span>
                          {listen.completion_percentage && (
                            <span>{Math.round(listen.completion_percentage)}% complete</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Favorites Breakdown */}
            {Object.keys(userData.favorite_counts).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Favorites Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(userData.favorite_counts).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{count}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type}s</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
              <button
                onClick={() => setActiveView('profile')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveView('preferences')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Update Preferences
              </button>
              <button
                onClick={() => setActiveView('history')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View History
              </button>
              <button
                onClick={() => setActiveView('favorites')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Manage Favorites
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
