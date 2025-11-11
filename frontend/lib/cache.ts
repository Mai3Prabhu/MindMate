/**
 * Client-side caching utilities for static content
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>>
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.cache = new Map()
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Clear specific key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Singleton instance
const cache = new ClientCache()

// Clear expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.clearExpired()
  }, 5 * 60 * 1000)
}

export default cache

/**
 * Hook for using cached data with SWR-like behavior
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number
    revalidateOnMount?: boolean
  }
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  mutate: () => Promise<void>
} {
  const [data, setData] = React.useState<T | null>(cache.get(key))
  const [isLoading, setIsLoading] = React.useState(!data)
  const [error, setError] = React.useState<Error | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await fetcher()
      
      cache.set(key, result, options?.ttl)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, options?.ttl])

  React.useEffect(() => {
    const cachedData = cache.get<T>(key)
    
    if (cachedData) {
      setData(cachedData)
      setIsLoading(false)
      
      // Optionally revalidate in background
      if (options?.revalidateOnMount) {
        fetchData()
      }
    } else {
      fetchData()
    }
  }, [key, fetchData, options?.revalidateOnMount])

  return {
    data,
    isLoading,
    error,
    mutate: fetchData,
  }
}

// Need to import React for the hook
import React from 'react'
