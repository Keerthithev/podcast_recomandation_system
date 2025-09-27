import React, { useEffect, useMemo, useState } from 'react'
import type { User } from './main'

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

type Tab = 'trending' | 'search' | 'saved' | 'categories' | 'recommends'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function Card({ p, onPlay }: { p: Podcast, onPlay: (p: Podcast) => void }) {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      {p.thumbnail && (
        <img src={p.thumbnail} alt={p.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{p.title}</h3>
        {p.publisher && <p className="text-sm text-gray-500 mt-1">{p.publisher}</p>}
        {p.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: p.description }} />
        )}
        <div className="mt-3 flex items-center gap-2">
          {p.audio_url ? (
            <button onClick={() => onPlay(p)} className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">Play</button>
          ) : p.external_url ? (
            <a href={p.external_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700">Open in {p.source || 'Source'}</a>
          ) : (
            <span className="text-xs text-gray-500">No audio available</span>
          )}
          {p.source && <span className="text-xs text-gray-400 ml-auto">{p.source}</span>}
        </div>
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

  const canSearch = useMemo(() => query.trim().length > 0, [query])
  const categories = [
    { key: 'news', label: 'News' },
    { key: 'technology', label: 'Technology' },
    { key: 'music', label: 'Music' },
    { key: 'sports', label: 'Sports' },
  ] as const

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${API_BASE}/podcasts/trending?provider=spotify`)
        const data: Podcast[] = await r.json()
        setTrending(data)
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
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
      if (user?.email) {
        void fetch(`${API_BASE}/user/search_log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, query })
        })
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
      setActiveTab('categories')
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
        className={`px-3 py-2 text-sm rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">Podcast Retrieval System</h1>
          <form onSubmit={onSearch} className="ml-auto flex items-center gap-2 w-full max-w-xl">
            <input
              className="flex-1 rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Search podcasts by keyword..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button disabled={!canSearch || loading} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <div className="ml-4 flex items-center gap-3">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            )}
            <button onClick={onLogout} className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">Logout</button>
          </div>
        </div>
        <div className="border-t dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 sticky top-[var(--tab-offset,0px)] z-10">
            <TabButton id="trending">Trending</TabButton>
            <TabButton id="search">Search</TabButton>
            <TabButton id="saved">Saved</TabButton>
            <TabButton id="categories">Categories</TabButton>
            <TabButton id="recommends">Recommends</TabButton>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {activeTab === 'trending' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Trending Podcasts</h2>
            {trending.length === 0 ? (
              <p className="text-sm text-gray-500">No trending podcasts available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.map(p => (
                  <Card key={p.id || p.title} p={p} onPlay={setCurrent} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'search' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Search Results</h2>
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {results ? (
              results.length === 0 ? (
                <p className="text-sm text-gray-500">No results.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(p => (
                    <Card key={(p.id || p.title)+"-result"} p={p} onPlay={setCurrent} />
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
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved ? (
              saved.length === 0 ? (
                <p className="text-sm text-gray-500">No saved podcasts yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {saved.map(p => (
                    <Card key={(p.id || p.title)+"-saved"} p={p} onPlay={setCurrent} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Open this tab to load saved items.</p>
            )}
          </section>
        )}

        {activeTab === 'categories' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(c => (
                <button key={c.key} onClick={() => runCategory(c.key)} className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  {c.label}
                </button>
              ))}
            </div>
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {results ? (
              results.length === 0 ? (
                <p className="text-sm text-gray-500">No results.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(p => (
                    <Card key={(p.id || p.title)+"-cat"} p={p} onPlay={setCurrent} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Choose a category to view podcasts.</p>
            )}
          </section>
        )}

        {activeTab === 'recommends' && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Recommendations</h2>
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {reco ? (
              reco.length === 0 ? (
                <p className="text-sm text-gray-500">No recommendations yet. Perform some searches.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reco.map(p => (
                    <Card key={(p.id || p.title)+"-reco"} p={p} onPlay={setCurrent} />
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Open this tab to fetch recommendations.</p>
            )}
          </section>
        )}

        {current && (
          <section className="sticky bottom-0 bg-white border-t p-3 rounded-t-lg shadow-lg dark:bg-gray-900 dark:border-gray-800">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                {current.thumbnail && <img src={current.thumbnail} alt="thumb" className="w-12 h-12 rounded" />}
                <div className="min-w-0">
                  <p className="font-medium truncate">{current.title}</p>
                  {current.publisher && <p className="text-xs text-gray-500 truncate">{current.publisher}</p>}
                </div>
              </div>
              {current.audio_url ? (
                <audio className="w-full mt-2" controls src={current.audio_url} />)
                : current.external_url ? (
                  <a href={current.external_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm text-indigo-600 hover:underline">Open in {current.source || 'Source'}</a>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">No audio available</p>
                )
              }
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
