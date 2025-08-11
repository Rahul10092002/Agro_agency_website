import type { NextRequest } from "next/server"

interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitData {
  count: number
  resetTime: number
}

const cache = new Map<string, RateLimitData>()

export default function rateLimit(options: RateLimitOptions) {
  return {
    check: async (request: NextRequest, limit: number, token: string) => {
      const key = `${token}_${request.ip || "anonymous"}`
      const now = Date.now()
      const windowStart = now - options.interval

      // Clean up old entries
      for (const [cacheKey, data] of cache.entries()) {
        if (data.resetTime < now) {
          cache.delete(cacheKey)
        }
      }

      const current = cache.get(key) || { count: 0, resetTime: now + options.interval }

      if (current.resetTime < now) {
        current.count = 1
        current.resetTime = now + options.interval
      } else {
        current.count += 1
      }

      cache.set(key, current)

      if (current.count > limit) {
        throw new Error("Rate limit exceeded")
      }

      return current
    },
  }
}
