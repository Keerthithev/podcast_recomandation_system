import React, { useState, useRef, useEffect } from 'react'

interface Podcast {
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

interface YouTubePlayerProps {
  podcast: Podcast
  recommendations: Podcast[]
  isMinimized: boolean
  onMinimize: () => void
  onClose: () => void
  onPlayRecommendation: (podcast: Podcast) => void
}

export default function YouTubePlayer({
  podcast,
  recommendations,
  isMinimized,
  onMinimize,
  onClose,
  onPlayRecommendation
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(podcast.duration || 0)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isAutoPlayingNext, setIsAutoPlayingNext] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Auto-play when component mounts or podcast changes
  useEffect(() => {
    if (audioRef.current && podcast.audio_url) {
      // Reset states
      setIsPlaying(false)
      setCurrentTime(0)
      setIsAutoPlayingNext(false)
      
      // Auto-play after a short delay to ensure audio is loaded
      const autoPlayTimer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true)
          }).catch((error) => {
            console.warn('Auto-play failed:', error)
            // Auto-play might be blocked by browser, that's okay
          })
        }
      }, 500)

      return () => clearTimeout(autoPlayTimer)
    }
  }, [podcast.id, podcast.audio_url])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      
      // Auto-play when metadata is loaded (backup for auto-play)
      if (!isPlaying && !isAutoPlayingNext) {
        setTimeout(() => {
          if (audioRef.current && !isPlaying) {
            audioRef.current.play().then(() => {
              setIsPlaying(true)
            }).catch((error) => {
              console.warn('Auto-play on metadata loaded failed:', error)
            })
          }
        }, 300)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    
    // Auto-play next podcast if available
    if (recommendations.length > 0) {
      setIsAutoPlayingNext(true)
      
      // Show loading state for 2-3 seconds before playing next
      const nextPlayTimer = setTimeout(() => {
        const nextPodcast = recommendations[0]
        if (nextPodcast) {
          onPlayRecommendation(nextPodcast)
        }
        setIsAutoPlayingNext(false)
      }, 2500) // 2.5 second delay

      return () => clearTimeout(nextPlayTimer)
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black rounded-lg shadow-2xl overflow-hidden max-w-sm">
        {/* Mini Player Header - Compact */}
        <div className="flex items-center space-x-2 p-2">
          {/* Thumbnail */}
          <div className="w-10 h-8 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
            {podcast.thumbnail ? (
              <img 
                src={podcast.thumbnail} 
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title and Controls */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-white line-clamp-1">
              {podcast.title}
            </h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Minimize and Close buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onMinimize}
              className="text-gray-400 hover:text-white transition-colors p-0.5"
              title="Maximize"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-0.5"
              title="Close"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-700">
          <div 
            className="h-full bg-red-600 transition-all duration-200"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Mini Player Content - Recommendations & Trending */}
        <div className="max-h-64 overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="p-2">
            {/* Recommendations Section */}
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-300 mb-2 px-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Recommendations
              </h5>
              <div className="space-y-1">
                {recommendations.slice(0, 4).map((rec, index) => (
                  <div
                    key={rec.id || index}
                    onClick={() => onPlayRecommendation(rec)}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-6 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                      {rec.thumbnail ? (
                        <img 
                          src={rec.thumbnail} 
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white line-clamp-1">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {rec.publisher}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {rec.duration ? formatTime(rec.duration) : '--:--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Section */}
            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-2 px-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
                Trending
              </h5>
              <div className="space-y-1">
                {recommendations.slice(4, 8).map((rec, index) => (
                  <div
                    key={`trending-${rec.id || index}`}
                    onClick={() => onPlayRecommendation(rec)}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-6 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                      {rec.thumbnail ? (
                        <img 
                          src={rec.thumbnail} 
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white line-clamp-1">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {rec.publisher}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {rec.duration ? formatTime(rec.duration) : '--:--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={podcast.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Back to browsing"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Now Playing</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Minimize"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9v4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v-4.5M15 15h4.5M15 15l5.5 5.5" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Left Side - Current Player & Trending */}
        <div className="flex-1 p-6">
          {/* Current Playing Podcast */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                {podcast.thumbnail ? (
                  <img 
                    src={podcast.thumbnail} 
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {podcast.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {podcast.publisher} • {podcast.source}
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors"
                    disabled={isAutoPlayingNext}
                  >
                    {isAutoPlayingNext ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isAutoPlayingNext ? 'Loading next...' : `${formatTime(currentTime)} / ${formatTime(duration)}`}
                  </span>
                </div>
                <div className="mt-3">
                  {/* Visual Progress Bar */}
                  <div className="relative mb-2">
                    <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-200"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Interactive Slider */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer slider absolute top-0 left-0 opacity-0"
                    disabled={isAutoPlayingNext}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trending Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
              Trending Now
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((rec, index) => (
                <div
                  key={rec.id || index}
                  onClick={() => onPlayRecommendation(rec)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    {rec.thumbnail ? (
                      <img 
                        src={rec.thumbnail} 
                        alt={rec.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {rec.publisher}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {rec.duration ? formatTime(rec.duration) : 'Unknown duration'}
                    </span>
                    <span className="text-xs text-gray-400">{rec.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Recommendations */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Recommendations
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-700">
            {recommendations.slice(6, 12).map((rec, index) => (
              <div
                key={rec.id || index}
                onClick={() => onPlayRecommendation(rec)}
                className="flex space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                  {rec.thumbnail ? (
                    <img 
                      src={rec.thumbnail} 
                      alt={rec.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {rec.publisher}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {rec.duration ? formatTime(rec.duration) : 'Unknown duration'}
                    </span>
                    <span className="text-xs text-gray-400">{rec.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={podcast.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />
    </div>
  )
}
