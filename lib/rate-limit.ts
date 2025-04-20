import { NextResponse } from "next/server"
import { logger } from "./logger"

// Rate limiter interface
interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Simple in-memory rate limiter - good for development or single-instance deployments
class InMemoryRateLimiter implements RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly maxRequests: number
  private readonly window: number // in milliseconds

  constructor(limit: number, windowInSeconds: number) {
    this.maxRequests = limit
    this.window = windowInSeconds * 1000
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const record = this.requests.get(identifier)

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance on each request
      this.cleanup(now)
    }

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

  private cleanup(now: number) {
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Constants for rate limits
const API_RATE_LIMIT = 100 // requests
const API_RATE_WINDOW = 60 // seconds
const AUTH_RATE_LIMIT = 20
const AUTH_RATE_WINDOW = 60

// Create different rate limiters for different endpoints
const defaultLimiter = new InMemoryRateLimiter(API_RATE_LIMIT, API_RATE_WINDOW)
const authLimiter = new InMemoryRateLimiter(AUTH_RATE_LIMIT, AUTH_RATE_WINDOW)

// Helper function to determine IP address from request
export function getIpAddress(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  return xff ? xff.split(',')[0].trim() : '127.0.0.1'
}

/**
 * Apply rate limiting to a request
 * @param request The incoming request
 * @param identifier An optional custom identifier (defaults to IP address)
 * @param type The type of rate limit to apply (default, auth)
 * @returns A response if rate limited, undefined otherwise
 */
export async function applyRateLimit(
  request: Request,
  identifier?: string,
  type: 'default' | 'auth' = 'default'
): Promise<NextResponse | undefined> {
  // Skip rate limiting in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_DEV_RATE_LIMIT) {
    return undefined
  }

  // Use IP as default identifier if none provided
  const key = identifier || getIpAddress(request)
  const limiter = type === 'auth' ? authLimiter : defaultLimiter
  const result = await limiter.limit(key)

  if (!result.success) {
    logger.warn('Rate limit exceeded', {
      path: request.url,
      ip: getIpAddress(request),
      type
    })

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
        }
      }
    )
  }

  return undefined
}

export async function rateLimit(
  identifier: string, 
  type: 'default' | 'auth' = 'default'
): Promise<{ limit: number; remaining: number; reset: number }> {
  // Skip rate limiting in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_DEV_RATE_LIMIT) {
    return { limit: 1000, remaining: 999, reset: Date.now() + 3600000 }
  }

  const limiter = type === 'auth' ? authLimiter : defaultLimiter
  const result = await limiter.limit(identifier)

  if (!result.success) {
    logger.warn('Rate limit exceeded in server action', { identifier, type })
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (result.reset - Date.now()) / 1000
      )} seconds.`
    )
  }

  return { 
    limit: result.limit, 
    remaining: result.remaining, 
    reset: result.reset 
  }
}