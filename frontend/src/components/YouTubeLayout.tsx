import React, { useState } from 'react'
import type { User } from '../main'

interface YouTubeLayoutProps {
  user: User | null
  onLogout: () => void
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onCategoryClick: (category: string) => void
  onSearch: (query: string) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  loading: boolean
  showSearchHistory: boolean
  onSearchHistoryToggle: () => void
  onSearchHistoryClose: () => void
  searchHistoryComponent?: React.ReactNode
  userSearchHistory?: Array<{query: string, timestamp: string}>
  userWatchHistory?: Array<{title: string, timestamp: string}>
  userFavorites?: Array<{title: string, timestamp: string}>
}

const categories = [
  { key: 'trending', label: 'Trending' },
  { key: 'news', label: 'News' },
  { key: 'technology', label: 'Technology' },
  { key: 'music', label: 'Music' },
  { key: 'sports', label: 'Sports' },
  { key: 'business', label: 'Business' },
  { key: 'education', label: 'Education' },
  { key: 'comedy', label: 'Comedy' },
  { key: 'health', label: 'Health' },
  { key: 'science', label: 'Science' },
  { key: 'entertainment', label: 'Entertainment' }
]

export default function YouTubeLayout({
  user,
  onLogout,
  children,
  activeTab,
  onTabChange,
  onCategoryClick,
  onSearch,
  searchQuery,
  onSearchQueryChange,
  loading,
  showSearchHistory,
  onSearchHistoryToggle,
  onSearchHistoryClose,
  searchHistoryComponent,
  userSearchHistory = [],
  userWatchHistory = [],
  userFavorites = []
}: YouTubeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMoreSearchHistory, setShowMoreSearchHistory] = useState(false)
  const [showMoreWatchHistory, setShowMoreWatchHistory] = useState(false)
  const [showMoreFavorites, setShowMoreFavorites] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const sidebarItems = [
    { id: 'trending', label: 'Home', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    )},
    { id: 'search', label: 'Search', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    { id: 'saved', label: 'Saved', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    )},
    { id: 'recommends', label: 'Recommendations', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )}
  ]

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Fixed Top Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Podify" 
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  onFocus={() => onSearchHistoryToggle()}
                  onBlur={() => {
                    setTimeout(() => onSearchHistoryClose(), 200)
                  }}
                  placeholder="Search podcasts..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => onSearchHistoryToggle()}
                  className="px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || loading}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Search History Dropdown */}
              {user && showSearchHistory && searchHistoryComponent}
            </form>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
                      <div className="px-4 py-3 border-b dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name || user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            onLogout()
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Categories Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-2">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => onCategoryClick(category.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeTab === category.key
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex-shrink-0 overflow-y-auto`}>
          <div className="p-2">
            {/* Main Navigation */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </nav>

            {/* Explore Section */}
            {!sidebarCollapsed && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Explore
                </h3>
                <nav className="space-y-1">
                  <button 
                    onClick={() => onCategoryClick('music')}
                    className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === 'music'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-sm">Music</span>
                  </button>
                  <button 
                    onClick={() => onCategoryClick('entertainment')}
                    className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === 'entertainment'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Entertainment</span>
                  </button>
                  <button 
                    onClick={() => onCategoryClick('sports')}
                    className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === 'sports'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="text-sm">Sports</span>
                  </button>
                </nav>
              </div>
            )}

            {/* You Section */}
            {user && !sidebarCollapsed && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                  You
                </h3>
                <nav className="space-y-1">
                  {/* Search History */}
                  <div>
                    <button className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm">Search History</span>
                    </button>
                    {userSearchHistory.length > 0 && (
                      <div className="ml-8 space-y-1">
                        {userSearchHistory.slice(0, showMoreSearchHistory ? userSearchHistory.length : 5).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              onSearchQueryChange(item.query)
                              onSearch(item.query)
                            }}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="text-xs truncate">{truncateText(item.query, 25)}</span>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
                          </button>
                        ))}
                        {userSearchHistory.length > 5 && (
                          <button
                            onClick={() => setShowMoreSearchHistory(!showMoreSearchHistory)}
                            className="w-full text-left px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {showMoreSearchHistory ? 'Show less' : `Show ${userSearchHistory.length - 5} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Watch History */}
                  <div>
                    <button className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Watch History</span>
                    </button>
                    {userWatchHistory.length > 0 && (
                      <div className="ml-8 space-y-1">
                        {userWatchHistory.slice(0, showMoreWatchHistory ? userWatchHistory.length : 5).map((item, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="text-xs truncate">{truncateText(item.title, 25)}</span>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
                          </button>
                        ))}
                        {userWatchHistory.length > 5 && (
                          <button
                            onClick={() => setShowMoreWatchHistory(!showMoreWatchHistory)}
                            className="w-full text-left px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {showMoreWatchHistory ? 'Show less' : `Show ${userWatchHistory.length - 5} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Favorites */}
                  <div>
                    <button className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">Favorites</span>
                    </button>
                    {userFavorites.length > 0 && (
                      <div className="ml-8 space-y-1">
                        {userFavorites.slice(0, showMoreFavorites ? userFavorites.length : 5).map((item, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="text-xs truncate">{truncateText(item.title, 25)}</span>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
                          </button>
                        ))}
                        {userFavorites.length > 5 && (
                          <button
                            onClick={() => setShowMoreFavorites(!showMoreFavorites)}
                            className="w-full text-left px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {showMoreFavorites ? 'Show less' : `Show ${userFavorites.length - 5} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </nav>
              </div>
            )}

            {/* Settings Section */}
            {!sidebarCollapsed && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <nav className="space-y-1">
                  <button className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm">Privacy Policy</span>
                  </button>
                  <button className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Help</span>
                  </button>
                </nav>
              </div>
            )}

            {/* Legal Links */}
            {!sidebarCollapsed && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>About</span>
                    <span>Press</span>
                    <span>Copyright</span>
                    <span>Contact us</span>
                    <span>Creators</span>
                    <span>Advertise</span>
                    <span>Developers</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>Terms</span>
                    <span>Privacy</span>
                    <span>Safety</span>
                    <span>How it works</span>
                    <span>Test new features</span>
                  </div>
                  <div className="mt-2 text-xs">
                    © 2025 Podify
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
