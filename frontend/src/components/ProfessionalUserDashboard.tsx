import React, { useState, useEffect } from 'react'
import { userService, CompleteUserData } from '../services/userService'

interface ProfessionalUserDashboardProps {
  userId: string
  onClose: () => void
}

export default function ProfessionalUserDashboard({ userId, onClose }: ProfessionalUserDashboardProps) {
  const [userData, setUserData] = useState<CompleteUserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'preferences' | 'history' | 'favorites'>('overview')
  const [preferences, setPreferences] = useState<any>(null)
  const [favorites, setFavorites] = useState<any[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [listenHistory, setListenHistory] = useState<any[]>([])
  const [tabLoading, setTabLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPreferences, setEditingPreferences] = useState(false)
  const [profileForm, setProfileForm] = useState<any>({})
  const [preferencesForm, setPreferencesForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

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
      setError(err.message || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const loadTabData = async (tab: string) => {
    if (tab === 'preferences' && !preferences) {
      try {
        setTabLoading(true)
        const prefs = await userService.getPreferences(userId)
        setPreferences(prefs)
        setPreferencesForm(prefs)
      } catch (err) {
        console.warn('Failed to load preferences:', err)
      } finally {
        setTabLoading(false)
      }
    } else if (tab === 'favorites' && favorites.length === 0) {
      try {
        setTabLoading(true)
        const favs = await userService.getFavorites(userId)
        setFavorites(favs.favorites)
      } catch (err) {
        console.warn('Failed to load favorites:', err)
      } finally {
        setTabLoading(false)
      }
    } else if (tab === 'history' && searchHistory.length === 0) {
      try {
        setTabLoading(true)
        const [searchData, listenData] = await Promise.all([
          userService.getSearchHistory(userId),
          userService.getListenHistory(userId)
        ])
        setSearchHistory(searchData.search_history)
        setListenHistory(listenData.listen_history)
      } catch (err) {
        console.warn('Failed to load history:', err)
      } finally {
        setTabLoading(false)
      }
    }
  }

  const startEditingProfile = () => {
    if (userData?.profile) {
      setProfileForm({
        full_name: userData.profile.full_name || '',
        username: userData.profile.username || '',
        bio: userData.profile.bio || ''
      })
      setEditingProfile(true)
    }
  }

  const startEditingPreferences = () => {
    if (preferences) {
      setPreferencesForm({
        preferred_language: preferences.preferred_language || '',
        max_duration: preferences.max_duration || 60,
        favorite_genres: preferences.favorite_genres || [],
        favorite_topics: preferences.favorite_topics || [],
        explicit_content: preferences.explicit_content || false,
        auto_play: preferences.auto_play || false,
        download_quality: preferences.download_quality || 'high'
      })
      setEditingPreferences(true)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      await userService.updateProfile(userId, profileForm)
      // Reload user data to get updated profile
      await loadUserData()
      setEditingProfile(false)
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      alert('Failed to save profile: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      await userService.updatePreferences(userId, preferencesForm)
      // Reload preferences
      const prefs = await userService.getPreferences(userId)
      setPreferences(prefs)
      setEditingPreferences(false)
    } catch (err: any) {
      console.error('Failed to save preferences:', err)
      alert('Failed to save preferences: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    setEditingProfile(false)
    setEditingPreferences(false)
    setProfileForm({})
    setPreferencesForm({})
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) return null

  const { profile, recent_searches = [], recent_listens = [], favorite_counts = {} } = userData

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Podify" 
                className="h-10 w-auto"
              />
              <h2 className="text-xl font-semibold text-gray-900">User Dashboard</h2>
            </div>
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

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {getInitials(profile?.full_name || '', profile?.email || '')}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{profile?.full_name || profile?.username}</h3>
                  <p className="text-sm text-gray-600">{profile?.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Member since {profile?.date_joined ? formatDate(profile.date_joined) : 'N/A'}
              </p>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'preferences', label: 'Preferences', icon: '⚙️' },
                { id: 'history', label: 'History', icon: '📜' },
                { id: 'favorites', label: 'Favorites', icon: '❤️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    loadTabData(tab.id)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Overview</h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recent_listens.length}</div>
                    <div className="text-sm text-gray-600">Episodes Listened</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDuration(recent_listens.reduce((acc, item) => acc + (item.duration_listened || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Listening Time</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{Object.values(favorite_counts).reduce((acc, count) => acc + count, 0)}</div>
                    <div className="text-sm text-gray-600">Total Favorites</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recent_searches.length}</div>
                    <div className="text-sm text-gray-600">Recent Searches</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Searches */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Searches</h4>
                    <div className="space-y-3">
                      {recent_searches.slice(0, 5).map((search, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{search.query}</p>
                            <p className="text-xs text-gray-500">{search.results_count} results</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {search.timestamp ? formatDate(search.timestamp) : ''}
                          </span>
                        </div>
                      ))}
                      {recent_searches.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No recent searches</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Listens */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Listens</h4>
                    <div className="space-y-3">
                      {recent_listens.slice(0, 5).map((listen, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{listen.podcast_title}</p>
                            <p className="text-xs text-gray-500">
                              {formatDuration(listen.duration_listened || 0)} / {formatDuration(listen.total_duration || 0)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {listen.timestamp ? formatDate(listen.timestamp) : ''}
                          </span>
                        </div>
                      ))}
                      {recent_listens.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No recent listens</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Favorites Breakdown */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Favorites Breakdown</h4>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">{Object.values(favorite_counts).reduce((acc, count) => acc + count, 0)}</div>
                    <div className="text-sm text-gray-600">Total Favorites</div>
                  </div>
                  {Object.keys(favorite_counts).length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {Object.entries(favorite_counts).map(([type, count]) => (
                        <div key={type} className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-600 capitalize">{type}s</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  {!editingProfile && (
                    <button
                      onClick={startEditingProfile}
                      className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  {editingProfile ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.full_name || ''}
                            onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <p className="text-gray-500 text-sm">Email cannot be changed</p>
                          <p className="text-gray-900">{profile?.email || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                          <input
                            type="text"
                            value={profileForm.username || ''}
                            onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                          <p className="text-gray-500 text-sm">Cannot be changed</p>
                          <p className="text-gray-900">{profile?.date_joined ? formatDate(profile.date_joined) : 'Not set'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={profileForm.bio || ''}
                          onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4">
                        <button
                          onClick={saveProfile}
                          disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <p className="text-gray-900">{profile?.email || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                          <p className="text-gray-900">{profile?.username || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                          <p className="text-gray-900">{profile?.date_joined ? formatDate(profile.date_joined) : 'Not set'}</p>
                        </div>
                      </div>
                      {profile?.bio && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                          <p className="text-gray-900">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                  {!editingPreferences && preferences && (
                    <button
                      onClick={startEditingPreferences}
                      className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
                    >
                      Edit Preferences
                    </button>
                  )}
                </div>
                
                {tabLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">Loading preferences...</span>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    {preferences ? (
                      editingPreferences ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                              <select
                                value={preferencesForm.preferred_language || ''}
                                onChange={(e) => setPreferencesForm({...preferencesForm, preferred_language: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select language</option>
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                                <option value="pt">Portuguese</option>
                                <option value="zh">Chinese</option>
                                <option value="ja">Japanese</option>
                                <option value="ko">Korean</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration (minutes)</label>
                              <input
                                type="number"
                                value={preferencesForm.max_duration || 60}
                                onChange={(e) => setPreferencesForm({...preferencesForm, max_duration: parseInt(e.target.value) || 60})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                                max="300"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Explicit Content</label>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="explicit_content"
                                    checked={preferencesForm.explicit_content === true}
                                    onChange={() => setPreferencesForm({...preferencesForm, explicit_content: true})}
                                    className="mr-2"
                                  />
                                  Allowed
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="explicit_content"
                                    checked={preferencesForm.explicit_content === false}
                                    onChange={() => setPreferencesForm({...preferencesForm, explicit_content: false})}
                                    className="mr-2"
                                  />
                                  Blocked
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Auto Play</label>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="auto_play"
                                    checked={preferencesForm.auto_play === true}
                                    onChange={() => setPreferencesForm({...preferencesForm, auto_play: true})}
                                    className="mr-2"
                                  />
                                  Enabled
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="auto_play"
                                    checked={preferencesForm.auto_play === false}
                                    onChange={() => setPreferencesForm({...preferencesForm, auto_play: false})}
                                    className="mr-2"
                                  />
                                  Disabled
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Genres</label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Add a genre (press Enter to add)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const value = e.currentTarget.value.trim()
                                    if (value && !preferencesForm.favorite_genres.includes(value)) {
                                      setPreferencesForm({
                                        ...preferencesForm,
                                        favorite_genres: [...preferencesForm.favorite_genres, value]
                                      })
                                      e.currentTarget.value = ''
                                    }
                                  }
                                }}
                              />
                              <div className="flex flex-wrap gap-2">
                                {preferencesForm.favorite_genres.map((genre: string, index: number) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                                    {genre}
                                    <button
                                      onClick={() => setPreferencesForm({
                                        ...preferencesForm,
                                        favorite_genres: preferencesForm.favorite_genres.filter((_, i) => i !== index)
                                      })}
                                      className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Topics</label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Add a topic (press Enter to add)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const value = e.currentTarget.value.trim()
                                    if (value && !preferencesForm.favorite_topics.includes(value)) {
                                      setPreferencesForm({
                                        ...preferencesForm,
                                        favorite_topics: [...preferencesForm.favorite_topics, value]
                                      })
                                      e.currentTarget.value = ''
                                    }
                                  }
                                }}
                              />
                              <div className="flex flex-wrap gap-2">
                                {preferencesForm.favorite_topics.map((topic: string, index: number) => (
                                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                                    {topic}
                                    <button
                                      onClick={() => setPreferencesForm({
                                        ...preferencesForm,
                                        favorite_topics: preferencesForm.favorite_topics.filter((_, i) => i !== index)
                                      })}
                                      className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-4">
                            <button
                              onClick={savePreferences}
                              disabled={saving}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={saving}
                              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                              <p className="text-gray-900">{preferences.preferred_language || 'Not set'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration (minutes)</label>
                              <p className="text-gray-900">{preferences.max_duration ? `${preferences.max_duration} min` : 'Not set'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Explicit Content</label>
                              <p className="text-gray-900">{preferences.explicit_content ? 'Allowed' : 'Blocked'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Auto Play</label>
                              <p className="text-gray-900">{preferences.auto_play ? 'Enabled' : 'Disabled'}</p>
                            </div>
                          </div>
                          
                          {preferences.favorite_genres && preferences.favorite_genres.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Genres</label>
                              <div className="flex flex-wrap gap-2">
                                {preferences.favorite_genres.map((genre: string, index: number) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {preferences.favorite_topics && preferences.favorite_topics.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Topics</label>
                              <div className="flex flex-wrap gap-2">
                                {preferences.favorite_topics.map((topic: string, index: number) => (
                                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-gray-600">No preferences set yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">History</h3>
                {tabLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">Loading history...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Search History */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Search History</h4>
                      {searchHistory.length > 0 ? (
                        <div className="space-y-3">
                          {searchHistory.map((search, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{search.query}</p>
                                <p className="text-xs text-gray-500">
                                  {search.results_count} results • {search.timestamp ? formatDate(search.timestamp) : 'Unknown date'}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  // Add functionality to re-run search
                                  console.log('Re-run search:', search.query)
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                              >
                                Search Again
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No search history found</p>
                      )}
                    </div>

                    {/* Listen History */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Listen History</h4>
                      {listenHistory.length > 0 ? (
                        <div className="space-y-3">
                          {listenHistory.map((listen, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{listen.podcast_title}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDuration(listen.duration_listened || 0)} / {formatDuration(listen.total_duration || 0)} • 
                                  {listen.timestamp ? formatDate(listen.timestamp) : 'Unknown date'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${listen.completion_percentage || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {Math.round(listen.completion_percentage || 0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No listen history found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Favorites</h3>
                {tabLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">Loading favorites...</span>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    {favorites.length > 0 ? (
                      <div className="space-y-4">
                        {favorites.map((favorite, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-4">
                              {favorite.item_image && (
                                <img 
                                  src={favorite.item_image} 
                                  alt={favorite.item_title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{favorite.item_title}</h4>
                                <p className="text-xs text-gray-500 capitalize">{favorite.item_type}</p>
                                {favorite.item_description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{favorite.item_description}</p>
                                )}
                                {favorite.tags && favorite.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {favorite.tags.slice(0, 3).map((tag, tagIndex) => (
                                      <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                    {favorite.tags.length > 3 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        +{favorite.tags.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {favorite.date_added ? formatDate(favorite.date_added) : 'Unknown date'}
                              </span>
                              <button
                                onClick={() => {
                                  // Add functionality to remove favorite
                                  console.log('Remove favorite:', favorite.favorite_id)
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                title="Remove from favorites"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-600">No favorites yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start exploring podcasts and add them to your favorites!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
