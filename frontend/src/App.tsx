import React, { useEffect, useMemo, useState } from 'react'
import type { User } from './main'
import ProfessionalUserDashboard from './components/ProfessionalUserDashboard'
import SpotifyAudioPlayer from './components/SpotifyAudioPlayer'
import YouTubePlayer from './components/YouTubePlayer'
import SearchHistoryDropdown from './components/SearchHistoryDropdown'
import YouTubeLayout from './components/YouTubeLayout'
import { SkeletonGrid, SkeletonSection } from './components/SkeletonLoader'
import { userService } from './services/userService'

type Podcast = {
  id?: string
  title: string
  description?: string
  audio_url?: string
  thumbnail?: string
  duration?: number
  source?: string
  publisher?: string
  language?: string
  external_url?: string
}

type Tab = 'trending' | 'search' | 'saved' | 'recommends' | 'news' | 'technology' | 'music' | 'sports' | 'business' | 'education' | 'comedy' | 'health' | 'science' | 'entertainment'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function Card({ p, onPlay, user }: { p: Podcast, onPlay: (p: Podcast) => void, user: User | null }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkingFavorite, setCheckingFavorite] = useState(false)

  useEffect(() => {
    if (user && p.id) {
      checkFavoriteStatus()
    }
  }, [user, p.id])

  const checkFavoriteStatus = async () => {
    if (!user || !p.id) return
    try {
      setCheckingFavorite(true)
      const result = await userService.checkFavoriteStatus(user.id, p.id, 'podcast')
      setIsFavorite(result.is_favorite)
    } catch (err) {
      // Ignore error, not critical
    } finally {
      setCheckingFavorite(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user || !p.id) return
    try {
      if (isFavorite) {
        await userService.removeFavoriteByItem(user.id, p.id, 'podcast')
        setIsFavorite(false)
      } else {
        await userService.addFavorite({
          user_id: user.id,
          item_type: 'podcast',
          item_id: p.id,
          item_title: p.title,
          item_description: p.description,
          item_image: p.thumbnail,
          tags: p.source ? [p.source] : []
        })
        setIsFavorite(true)
      }
    } catch (err) {
      console.warn('Failed to toggle favorite:', err)
    }
  }

  const handlePlay = (podcast: Podcast) => {
    onPlay(podcast)
    // Track listen history
    if (user && podcast.id) {
      userService.addListenHistory({
        user_id: user.id,
        podcast_id: podcast.id,
        podcast_title: podcast.title,
        duration_listened: 0,
        total_duration: podcast.duration || 0,
        platform: podcast.source || 'unknown'
      }).catch(err => console.warn('Failed to track listen history:', err))
    }
  }

  return (
    <div 
      className="relative rounded-lg border bg-white shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => handlePlay(p)}
    >
      {p.thumbnail && (
        <div className="relative">
          <img src={p.thumbnail} alt={p.title} className="w-full h-40 object-cover" />
          {/* Hover Play Button Preview */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{p.title}</h3>
        {p.publisher && <p className="text-sm text-gray-500 mt-1">{p.publisher}</p>}
        {p.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: p.description }} />
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Removed the "Click to listen" text */}
          </div>
          
          {/* Duration and source info */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {p.duration && <span>{Math.floor(p.duration / 60)} min</span>}
            {p.source && <span>• {p.source}</span>}
          </div>
        </div>
        
        {/* Favorite button */}
        {user && p.id && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite()
            }}
            disabled={checkingFavorite}
            className={`absolute top-2 right-2 p-1.5 rounded transition-colors ${
              isFavorite 
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default function App({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('trending')
  const [trending, setTrending] = useState<Podcast[]>([])
  const [results, setResults] = useState<Podcast[] | null>(null)
  const [saved, setSaved] = useState<Podcast[] | null>(null)
  const [reco, setReco] = useState<Podcast[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState<Podcast | null>(null)
  const [showUserDashboard, setShowUserDashboard] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [dashboardView, setDashboardView] = useState<'overview' | 'profile' | 'preferences' | 'history' | 'favorites'>('overview')
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false)
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [userSearchHistory, setUserSearchHistory] = useState<Array<{query: string, timestamp: string}>>([])
  const [userWatchHistory, setUserWatchHistory] = useState<Array<{title: string, timestamp: string}>>([])
  const [userFavorites, setUserFavorites] = useState<Array<{title: string, timestamp: string}>>([])

  const canSearch = useMemo(() => query.trim().length > 0, [query])

  const openDashboard = (view: 'overview' | 'profile' | 'preferences' | 'history' | 'favorites' = 'overview') => {
    setDashboardView(view)
    setShowUserDashboard(true)
    setShowUserDropdown(false)
  }

  const handlePlay = (podcast: Podcast) => {
    setCurrent(podcast)
    setShowYouTubePlayer(true)
    setIsPlayerMinimized(false)
  }

  const handlePlayRecommendation = (podcast: Podcast) => {
    setCurrent(podcast)
    // Keep the player open but switch to new podcast
  }

  const handleMinimizePlayer = () => {
    setIsPlayerMinimized(!isPlayerMinimized)
  }

  const handleClosePlayer = () => {
    setShowYouTubePlayer(false)
    setIsPlayerMinimized(false)
    setCurrent(null)
  }


  const loadUserHistory = async () => {
    if (!user) {
      console.log('No user found, skipping history load')
      return
    }
    
    console.log('Loading user history for user:', user.id)
    
    try {
      // Load search history
      const searchHistoryResponse = await userService.getSearchHistory(user.id)
      console.log('Search history response:', searchHistoryResponse)
      setUserSearchHistory(searchHistoryResponse.search_history.slice(0, 10).map(item => ({
        query: item.query,
        timestamp: item.timestamp || new Date().toISOString()
      })))

      // Load watch history
      const watchHistoryResponse = await userService.getListenHistory(user.id)
      console.log('Watch history response:', watchHistoryResponse)
      setUserWatchHistory(watchHistoryResponse.listen_history.slice(0, 10).map(item => ({
        title: item.podcast_title,
        timestamp: item.timestamp || new Date().toISOString()
      })))

      // Load favorites
      const favoritesResponse = await userService.getFavorites(user.id)
      console.log('Favorites response:', favoritesResponse)
      setUserFavorites(favoritesResponse.favorites.slice(0, 10).map(item => ({
        title: item.item_title,
        timestamp: item.date_added || new Date().toISOString()
      })))
    } catch (err) {
      console.warn('Failed to load user history:', err)
      
      // Add some mock data for demonstration if API fails
      const now = new Date()
      const mockSearchHistory = [
        { query: "AI and machine learning", timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
        { query: "tech news podcasts", timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString() },
        { query: "business podcasts", timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() },
        { query: "comedy shows", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { query: "science and technology", timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ]
      
      const mockWatchHistory = [
        { title: "The Daily Tech Podcast", timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
        { title: "AI Today with John Smith", timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() },
        { title: "Business Weekly Roundup", timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString() },
        { title: "Comedy Central Podcast", timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() },
        { title: "Science Explained", timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]
      
      const mockFavorites = [
        { title: "The Joe Rogan Experience", timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { title: "TED Talks Daily", timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { title: "This American Life", timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { title: "Radiolab", timestamp: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString() },
        { title: "Freakonomics Radio", timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      ]
      
      setUserSearchHistory(mockSearchHistory)
      setUserWatchHistory(mockWatchHistory)
      setUserFavorites(mockFavorites)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        setInitialLoading(true)
        const r = await fetch(`${API_BASE}/podcasts/trending?provider=spotify`)
        const data: Podcast[] = await r.json()
        setTrending(data)
      } catch (e) {
        // ignore
      } finally {
        setInitialLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserHistory()
    }
  }, [user])

  async function onSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!canSearch) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const r = await fetch(`${API_BASE}/podcasts/search?query=${encodeURIComponent(query)}&provider=spotify`)
      if (!r.ok) throw new Error('Request failed')
      const data: Podcast[] = await r.json()
      setResults(data)
      setActiveTab('search')
      
      // Track search in both old and new systems
      if (user?.email) {
        // Old system
        void fetch(`${API_BASE}/user/search_log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, query })
        })
        
        // New user management system
        try {
          await userService.addSearchHistory({
            user_id: user.id,
            query,
            results_count: data.length,
            filters_applied: { provider: 'spotify' }
          })
        } catch (err) {
          console.warn('Failed to track search history:', err)
        }
      }
      
      // Refresh user history after search
      if (user) {
        loadUserHistory()
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to search')
    } finally {
      setLoading(false)
    }
  }

  async function loadSaved() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API_BASE}/podcasts/saved`)
      const data: Podcast[] = await r.json()
      setSaved(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load saved')
    } finally {
      setLoading(false)
    }
  }

  async function loadReco() {
    if (!user?.email) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API_BASE}/user/recommendations?email=${encodeURIComponent(user.email)}`)
      const data: Podcast[] = await r.json()
      setReco(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  async function runCategory(cat: string) {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const r = await fetch(`${API_BASE}/podcasts/search?query=${encodeURIComponent(cat)}&provider=spotify`)
      const data: Podcast[] = await r.json()
      setResults(data)
      // Don't set activeTab here anymore - it's set in handleCategoryClick
      if (user?.email) {
        void fetch(`${API_BASE}/user/search_log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, query: cat })
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load category')
    } finally {
      setLoading(false)
    }
  }

  function TabButton({ id, children }: { id: Tab, children: React.ReactNode }) {
    const isActive = activeTab === id
    return (
      <button
        onClick={() => {
          setActiveTab(id)
          if (id === 'saved' && saved === null) {
            void loadSaved()
          } else if (id === 'recommends' && reco === null) {
            void loadReco()
          }
        }}
        className={`px-3 py-2 text-sm rounded ${isActive ? 'bg-blue-800 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        {children}
      </button>
    )
  }

  const handleCategoryClick = (category: string) => {
    if (category === 'trending') {
      setActiveTab('trending')
    } else {
      // Set the active tab to the category name so the sticky bar shows it as selected
      setActiveTab(category as Tab)
      runCategory(category)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab)
    if (tab === 'saved' && saved === null) {
      void loadSaved()
    } else if (tab === 'recommends' && reco === null) {
      void loadReco()
    }
  }

  return (
    <>
      <YouTubeLayout
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCategoryClick={handleCategoryClick}
        onSearch={onSearch}
        searchQuery={query}
        onSearchQueryChange={setQuery}
        loading={loading}
        showSearchHistory={showSearchHistory}
        onSearchHistoryToggle={() => setShowSearchHistory(!showSearchHistory)}
        onSearchHistoryClose={() => setShowSearchHistory(false)}
        searchHistoryComponent={user && showSearchHistory ? (
                  <SearchHistoryDropdown
                    isOpen={showSearchHistory}
                    onClose={() => setShowSearchHistory(false)}
                    onSearch={(searchQuery) => {
                      setQuery(searchQuery)
                      setShowSearchHistory(false)
                      onSearch()
                    }}
                    userId={user.id}
                  />
        ) : undefined}
        userSearchHistory={userSearchHistory}
        userWatchHistory={userWatchHistory}
        userFavorites={userFavorites}
      >
        <div className="space-y-8">
        {activeTab === 'trending' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Trending Podcasts</h2>
            {initialLoading ? (
              <SkeletonGrid count={6} />
            ) : trending.length === 0 ? (
              <p className="text-sm text-gray-500">No trending podcasts available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.map(p => (
                  <Card key={p.id || p.title} p={p} onPlay={handlePlay} user={user} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'search' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Search Results</h2>
            {loading ? (
              <SkeletonGrid count={6} />
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : results ? (
              results.length === 0 ? (
                <p className="text-sm text-gray-500">No results.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(p => (
                    <Card key={(p.id || p.title)+"-result"} p={p} onPlay={handlePlay} user={user} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Try a search above.</p>
            )}
          </section>
        )}

        {activeTab === 'saved' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Saved</h2>
            {loading ? (
              <SkeletonGrid count={6} />
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : saved ? (
              saved.length === 0 ? (
                <p className="text-sm text-gray-500">No saved podcasts yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {saved.map(p => (
                    <Card key={(p.id || p.title)+"-saved"} p={p} onPlay={handlePlay} user={user} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Open this tab to load saved items.</p>
            )}
          </section>
        )}


        {activeTab === 'recommends' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Recommendations</h2>
            {loading ? (
              <SkeletonGrid count={6} />
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : reco ? (
              reco.length === 0 ? (
                <p className="text-sm text-gray-500">No recommendations yet. Perform some searches.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reco.map(p => (
                    <Card key={(p.id || p.title)+"-reco"} p={p} onPlay={handlePlay} user={user} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Open this tab to fetch recommendations.</p>
            )}
          </section>
        )}

        {/* Category Results */}
        {['news', 'technology', 'music', 'sports', 'business', 'education', 'comedy', 'health', 'science', 'entertainment'].includes(activeTab) && (
          <section>
            <h2 className="text-xl font-semibold mb-3 capitalize">{activeTab} Podcasts</h2>
            {loading ? (
              <SkeletonGrid count={6} />
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : results ? (
              results.length === 0 ? (
                <p className="text-sm text-gray-500">No {activeTab} podcasts found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(p => (
                    <Card key={(p.id || p.title)+"-cat"} p={p} onPlay={handlePlay} user={user} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Click on a category to view podcasts.</p>
            )}
          </section>
        )}
        </div>
      </YouTubeLayout>

      {/* Professional User Dashboard Modal */}
      {showUserDashboard && user && (
        <ProfessionalUserDashboard
          userId={user.id}
          onClose={() => setShowUserDashboard(false)}
        />
      )}

      {/* YouTube Style Player */}
      {showYouTubePlayer && current && (
        <YouTubePlayer
          podcast={current}
          recommendations={trending.slice(0, 10)} // Use trending podcasts as recommendations
          isMinimized={isPlayerMinimized}
          onMinimize={handleMinimizePlayer}
          onClose={handleClosePlayer}
          onPlayRecommendation={handlePlayRecommendation}
        />
      )}

      {/* Spotify Audio Player (Legacy) */}
      {showAudioPlayer && current && (
        <SpotifyAudioPlayer
          podcast={current}
          onClose={() => {
            setShowAudioPlayer(false)
            setCurrent(null)
          }}
        />
      )}
    </>
  )
}
