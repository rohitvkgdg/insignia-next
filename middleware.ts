import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { applyRateLimit, getIpAddress } from "./lib/rate-limit"
import { logger } from "./lib/logger"

const publicPaths = ["/", "/auth/signin", "/api/auth", "/events"]
const apiPaths = ["/api/"]
const authPaths = ["/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  try {
    // Apply rate limiting for API routes
    if (apiPaths.some(path => pathname.startsWith(path))) {
      // Apply stricter rate limiting to auth endpoints
      const limiterType = authPaths.some(path => pathname.startsWith(path)) ? 'auth' : 'default'
      const rateLimited = await applyRateLimit(request, undefined, limiterType)
      
      if (rateLimited) return rateLimited
    }

    // Check if the path is public
    if (publicPaths.some((path) => pathname.startsWith(path))) {
      return addSecurityHeaders(NextResponse.next())
    }

    // Verify authentication
    const token = await getToken({ req: request })
    if (!token) {
      logger.info("Redirecting unauthenticated request", { 
        path: pathname, 
        ip: getIpAddress(request)
      })
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }

    // Role-based access control
    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      logger.warn("Unauthorized admin access attempt", { 
        userId: token.sub,
        path: pathname
      })
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/coordinator") && 
        token.role !== "ADMIN" && token.role !== "COORDINATOR") {
      logger.warn("Unauthorized coordinator access attempt", { 
        userId: token.sub,
        path: pathname
      })
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add security headers
    return addSecurityHeaders(NextResponse.next())
  } catch (error) {
    logger.error("Middleware error", error instanceof Error ? error : new Error(String(error)))
    return addSecurityHeaders(NextResponse.next())
  }
}

// Helper to add security headers to all responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Essential security headers for all environments
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )
  
  // Production-specific security headers
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
    response.headers.set("X-XSS-Protection", "1; mode=block")
    
    // Add Content-Security-Policy in production
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com;"
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/* (Next.js internals)
     * 2. /fonts/* (inside public directory)
     * 3. /images/* (inside public directory)
     * 4. /*.* (files with extensions)
     */
    "/((?!_next|fonts|images|[\\w-]+\\.\\w+).*)",
  ],
}