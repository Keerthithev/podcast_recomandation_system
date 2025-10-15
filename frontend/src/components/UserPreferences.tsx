import React, { useState, useEffect } from 'react'
import { userService, UserPreferences as UserPreferencesType } from '../services/userService'

interface UserPreferencesProps {
  userId: string
  onClose: () => void
}

const AVAILABLE_GENRES = [
  'Comedy', 'Technology', 'Business', 'News', 'Sports', 'Music', 'Health', 'Education',
  'Science', 'History', 'True Crime', 'Fiction', 'Self-Help', 'Politics', 'Entertainment',
  'Arts', 'Religion', 'Philosophy', 'Travel', 'Food'
]

const AVAILABLE_TOPICS = [
  'AI & Machine Learning', 'Startups', 'Productivity', 'Leadership', 'Marketing',
  'Finance', 'Cryptocurrency', 'Web Development', 'Mobile Apps', 'Design',
  'Psychology', 'Mindfulness', 'Fitness', 'Nutrition', 'Career Development',
  'Innovation', 'Climate Change', 'Social Issues', 'Pop Culture', 'Gaming'
]

const TIME_SLOTS = [
  'Early Morning (5-8 AM)', 'Morning (8-12 PM)', 'Afternoon (12-5 PM)',
  'Evening (5-8 PM)', 'Night (8-11 PM)', 'Late Night (11 PM+)', 'Commute', 'Workout'
]

const CONTENT_TYPES = [
  'Educational', 'Entertainment', 'News & Current Affairs', 'Interviews',
  'Storytelling', 'Documentary', 'Comedy', 'Music', 'Live Shows', 'Debates'
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian'
]

export default function UserPreferences({ userId, onClose }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferencesType>({
    user_id: userId,
    preferred_language: 'en',
    max_duration: 60,
    favorite_genres: [],
    favorite_topics: [],
    explicit_content: false,
    auto_play: true,
    download_quality: 'high'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      setError(null)
      const prefs = await userService.getPreferences(userId)
      setPreferences(prefs)
    } catch (err: any) {
      // If preferences don't exist, use defaults
      if (!err.message.includes('404')) {
        setError(err.message || 'Failed to load preferences')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await userService.updatePreferences(userId, preferences)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string, setter: (newArray: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const updatePreferences = (updates: Partial<UserPreferencesType>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading preferences...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Language</label>
              <select
                value={preferences.preferred_language}
                onChange={(e) => updatePreferences({ preferred_language: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Duration (minutes): {preferences.max_duration}
              </label>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={preferences.max_duration}
                onChange={(e) => updatePreferences({ max_duration: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>15 min</span>
                <span>3 hours</span>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Favorite Genres</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleArrayItem(
                    preferences.favorite_genres,
                    genre,
                    (newGenres) => updatePreferences({ favorite_genres: newGenres })
                  )}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    preferences.favorite_genres.includes(genre)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {preferences.favorite_genres.length} genres
            </p>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Favorite Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {AVAILABLE_TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleArrayItem(
                    preferences.favorite_topics,
                    topic,
                    (newTopics) => updatePreferences({ favorite_topics: newTopics })
                  )}
                  className={`px-3 py-2 text-sm rounded border transition-colors text-left ${
                    preferences.favorite_topics.includes(topic)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {preferences.favorite_topics.length} topics
            </p>
          </div>

          {/* Additional Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Content Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.explicit_content || false}
                    onChange={(e) => updatePreferences({ explicit_content: e.target.checked })}
                    className="mr-3"
                  />
                  <span>Allow explicit content</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.auto_play || false}
                    onChange={(e) => updatePreferences({ auto_play: e.target.checked })}
                    className="mr-3"
                  />
                  <span>Auto-play next episode</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Download Quality</h3>
              <select
                value={preferences.download_quality || 'high'}
                onChange={(e) => updatePreferences({ download_quality: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="low">Low (64 kbps)</option>
                <option value="medium">Medium (128 kbps)</option>
                <option value="high">High (256 kbps)</option>
                <option value="lossless">Lossless (320+ kbps)</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Preferences Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Language:</strong> {preferences.preferred_language}</p>
                <p><strong>Max Duration:</strong> {preferences.max_duration} minutes</p>
                <p><strong>Download Quality:</strong> {preferences.download_quality}</p>
              </div>
              <div>
                <p><strong>Genres:</strong> {preferences.favorite_genres.length} selected</p>
                <p><strong>Topics:</strong> {preferences.favorite_topics.length} selected</p>
                <p><strong>Explicit Content:</strong> {preferences.explicit_content ? 'Allowed' : 'Blocked'}</p>
                <p><strong>Auto-play:</strong> {preferences.auto_play ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
