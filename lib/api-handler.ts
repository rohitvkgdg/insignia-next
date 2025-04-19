import { NextResponse } from "next/server"
import * as z from "zod"
import { rateLimit } from "./rate-limit"
import { logger } from "./logger"

export type ApiResponse<T> = {
  data?: T
  error?: string
  code?: string
}

type ApiHandler = (
  req: Request,
  params?: { params: { [key: string]: string } }
) => Promise<Response>

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, params?) => {
    const startTime = Date.now()

    try {
      // Apply rate limiting based on IP
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
      await rateLimit(ip)

      logger.info("API request", {
        method: req.method,
        url: req.url,
        ip,
      })

      const response = await handler(req, params)

      // Log successful requests
      logger.info("API response", {
        method: req.method,
        url: req.url,
        status: response.status,
        duration: Date.now() - startTime,
      })

      return response
    } catch (error) {
      // Log errors with detailed information
      logger.error(
        "API Error",
        error instanceof Error ? error : new Error("Unknown error"),
        {
          method: req.method,
          url: req.url,
          duration: Date.now() - startTime,
        }
      )

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid request data",
            code: "VALIDATION_ERROR",
            details: error.errors,
          },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: error.message,
            code: "REQUEST_ERROR",
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      )
    }
  }
}