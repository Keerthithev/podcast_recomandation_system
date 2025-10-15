import React from 'react'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {/* Image skeleton */}
      <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-3" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        </div>
        
        {/* Button and info skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  className?: string
}

export function SkeletonGrid({ count = 6, className = "" }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

interface SkeletonHeaderProps {
  className?: string
}

export function SkeletonHeader({ className = "" }: SkeletonHeaderProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          
          {/* Search form skeleton */}
          <div className="ml-auto flex items-center gap-2 w-full max-w-xl">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          {/* User section skeleton */}
          <div className="ml-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface SkeletonTabsProps {
  className?: string
}

export function SkeletonTabs({ className = "" }: SkeletonTabsProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SkeletonSectionProps {
  title?: string
  showGrid?: boolean
  gridCount?: number
  className?: string
}

export function SkeletonSection({ 
  title, 
  showGrid = true, 
  gridCount = 6, 
  className = "" 
}: SkeletonSectionProps) {
  return (
    <section className={`p-4 ${className}`}>
      {title && (
        <div className="mb-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      )}
      
      {showGrid ? (
        <SkeletonGrid count={gridCount} />
      ) : (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      )}
    </section>
  )
}

// Main skeleton loader for the entire app
export function SkeletonApp() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkeletonHeader />
      <SkeletonTabs />
      <main className="max-w-6xl mx-auto">
        <SkeletonSection title="Loading podcasts..." gridCount={6} />
      </main>
    </div>
  )
}

export default SkeletonCard

