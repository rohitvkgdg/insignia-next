import { NextResponse } from "next/server"
import * as z from "zod"
import { rateLimit, applyRateLimit, getIpAddress } from "./rate-limit"
import { logger } from "./logger"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export type ApiResponse<T> = {
  data?: T
  error?: string
  code?: string
  details?: Record<string, any>
}

// Custom error types for better API responses
export class ValidationError extends Error {
  details: Record<string, any>
  
  constructor(message: string, details: Record<string, any> = {}) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'ResourceNotFoundError'
  }
}

// API configuration options
interface ApiOptions {
  rateLimit?: boolean
  timeout?: number  // in ms, default 15000 (15s)
  requireAuth?: boolean
  csrfProtection?: boolean
  apiVersion?: string
}

type ApiHandler = (
  req: Request,
  params?: { params: { [key: string]: string } }
) => Promise<Response>

/**
 * API wrapper with comprehensive error handling, rate limiting, and security features
 */ 
export function withApiHandler(handler: ApiHandler, options: ApiOptions = {}): ApiHandler {
  // Set default options
  const opts = {
    rateLimit: true,
    timeout: 15000,
    requireAuth: false,
    csrfProtection: true,
    apiVersion: 'v1',
    ...options
  }

  return async (req: Request, params?) => {
    const startTime = Date.now()
    const ip = getIpAddress(req)
    const url = new URL(req.url)
    const requestId = crypto.randomUUID()

    // Add timeout for long-running requests
    let timeoutId: NodeJS.Timeout | null = null
    const timeoutPromise = new Promise<Response>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${opts.timeout}ms`))
      }, opts.timeout)
    })

    try {
      // Add API versioning to response headers
      const headers = new Headers({
        'X-API-Version': opts.apiVersion,
        'X-Request-ID': requestId
      })

      // Apply rate limiting if enabled
      if (opts.rateLimit) {
        const limiterType = url.pathname.includes('/auth') ? 'auth' : 'default'
        const rateLimited = await applyRateLimit(req, undefined, limiterType)
        if (rateLimited) return rateLimited
      }

      // Check CSRF protection if enabled
      if (opts.csrfProtection && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const csrfToken = req.headers.get('X-CSRF-Token')
        // In a real implementation, you'd validate this token against one stored in the user's session
        if (!csrfToken && process.env.NODE_ENV === 'production') {
          logger.warn('CSRF token missing', { ip, method: req.method, path: url.pathname })
          return NextResponse.json(
            { error: 'Invalid or missing CSRF token', code: 'CSRF_ERROR' },
            { status: 403, headers }
          )
        }
      }

      logger.info("API request", {
        method: req.method,
        url: req.url,
        ip,
        requestId
      })

      // Race against timeout
      const handlerPromise = handler(req, params)
      const response: Response = await Promise.race([handlerPromise, timeoutPromise])

      // Log successful requests
      logger.info("API response", {
        method: req.method,
        url: req.url,
        status: response.status,
        duration: Date.now() - startTime,
        requestId
      })

      // Add standard headers to the response
      const enhancedResponse = new Response(response.body, response)
      
      // Copy original headers
      response.headers.forEach((value, key) => {
        enhancedResponse.headers.set(key, value)
      })
      
      // Add our custom headers
      headers.forEach((value, key) => {
        enhancedResponse.headers.set(key, value)
      })

      return enhancedResponse
    } catch (error) {
      // Clear timeout if it exists
      if (timeoutId) clearTimeout(timeoutId)

      // Log errors with detailed information
      logger.error(
        "API Error",
        error instanceof Error ? error : new Error("Unknown error"),
        {
          method: req.method,
          url: req.url,
          duration: Date.now() - startTime,
          requestId
        }
      )

      const headers = new Headers({
        'X-API-Version': opts.apiVersion,
        'X-Request-ID': requestId
      })

      // Handle specific error types with appropriate status codes
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.flatten().fieldErrors,
          },
          { status: 400, headers }
        )
      }

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: "VALIDATION_ERROR",
            details: error.details,
          },
          { status: 400, headers }
        )
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: "UNAUTHORIZED",
          },
          { status: 401, headers }
        )
      }

      if (error instanceof ResourceNotFoundError) {
        return NextResponse.json(
          {
            error: error.message,
            code: "NOT_FOUND",
          },
          { status: 404, headers }
        )
      }

      // Handle Prisma-specific errors
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle unique constraint violations
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || []
          return NextResponse.json(
            {
              error: `A record with this ${target.join(', ')} already exists`,
              code: "CONFLICT",
            },
            { status: 409, headers }
          )
        }
        
        // Handle record not found
        if (error.code === 'P2025') {
          return NextResponse.json(
            {
              error: "Resource not found",
              code: "NOT_FOUND",
            },
            { status: 404, headers }
          )
        }

        // Other database errors - don't expose details in production
        return NextResponse.json(
          {
            error: "Database operation failed",
            code: "DATABASE_ERROR",
            // Only include details in development
            ...(process.env.NODE_ENV !== 'production' && { details: error.message }),
          },
          { status: 500, headers }
        )
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return NextResponse.json(
          {
            error: "Request timed out",
            code: "TIMEOUT",
          },
          { status: 408, headers }
        )
      }

      // Generic error handler
      return NextResponse.json(
        {
          error: process.env.NODE_ENV === 'production' 
            ? "Internal server error" 
            : error instanceof Error ? error.message : "Unknown error",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500, headers }
      )
    }
  }
}

// For backward compatibility
export const withErrorHandler = withApiHandler;