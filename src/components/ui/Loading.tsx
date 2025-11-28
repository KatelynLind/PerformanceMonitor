import React from 'react'

interface LoadingProps {
  message?: string
  fullScreen?: boolean
}

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
      </div>
      {message && <p className="text-gray-300 text-center">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-700 animate-pulse rounded ${className}`} />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
  )
}
