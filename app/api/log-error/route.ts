import { NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-handler"
import { logger } from "@/lib/logger"
import { z } from "zod"

// Validation schema for client error reports
const errorReportSchema = z.object({
  message: z.string().min(1).max(500),
  source: z.string().optional(),
  lineno: z.number().optional(),
  colno: z.number().optional(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  type: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
})

type ErrorReport = z.infer<typeof errorReportSchema>

/**
 * API endpoint for client-side error logging
 * POST /api/log-error
 */
async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const body = await req.json()
    const validatedData = errorReportSchema.parse(body)
    
    // Enhance with additional context
    const errorContext = {
      userAgent: req.headers.get("user-agent") || "unknown",
      referer: req.headers.get("referer"),
      ...validatedData
    }
    
    // Log the client-side error with appropriate level
    logger.error("Client-side error", 
      new Error(validatedData.message), 
      errorContext
    )
    
    return NextResponse.json({ status: "logged" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid error report format" }, 
        { status: 400 }
      )
    }
    
    logger.error("Error processing client error report", 
      error instanceof Error ? error : new Error(String(error))
    )
    
    return NextResponse.json(
      { error: "Failed to process error report" }, 
      { status: 500 }
    )
  }
}

// Apply API handler with rate limiting and other protections
export const POST = withApiHandler(handler, {
  // Use stricter rate limiting for the error logging endpoint
  // to prevent abuse while still capturing legitimate errors
  timeout: 5000,
  rateLimit: true
})