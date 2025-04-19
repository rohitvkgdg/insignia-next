// Simple in-memory rate limiter
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly maxRequests: number
  private readonly window: number // in milliseconds

  constructor(limit: number, windowInSeconds: number) {
    this.maxRequests = limit
    this.window = windowInSeconds * 1000
  }

  async limit(identifier: string) {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.window,
      })
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.window,
      }
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
      }
    }

    record.count++
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    }
  }
}

// Create a new ratelimiter that allows 10 requests per 10 seconds
const rateLimiter = new InMemoryRateLimiter(10, 10)

export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await rateLimiter.limit(identifier)

  if (!success) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (reset - Date.now()) / 1000
      )} seconds.`
    )
  }

  return { limit, remaining, reset }
}