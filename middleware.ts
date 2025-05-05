import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { applyRateLimit, getIpAddress } from "./lib/rate-limit"
import { logger } from "./lib/logger"

const publicPaths = ["/", "/auth/signin", "/api/auth", "/events", "/about", "/contact", "/faq"]
const profileProtectedPaths = ["/profile", "/admin", "/events/[id]/team-registration"]
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

    // For paths that require a complete profile, check profile completion
    if (profileProtectedPaths.some(path => pathname.includes(path)) && !token.profileCompleted) {
      const url = new URL("/profile", request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }

    return addSecurityHeaders(NextResponse.next())
  } catch (error) {
    logger.error("Middleware error:", { error: error instanceof Error ? error.message : String(error), path: pathname })
    return addSecurityHeaders(NextResponse.next())
  }
}

// Helper to add security headers to all responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add your security headers here
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
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
     * 5. /_rsc/* (React Server Components)
     */
    "/((?!_next|_rsc|fonts|images|[\\w-]+\\.\\w+).*)",
  ],
}