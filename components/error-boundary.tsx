"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

// List of expected error messages we can show to users
const KNOWN_ERRORS: Record<string, string> = {
  "Failed to fetch": "Network connection issue. Please check your internet connection and try again.",
  "Not authenticated": "Your session has expired. Please sign in again.",
  "Unauthorized": "You don't have permission to access this resource.",
}

export default function ErrorBoundary({ error, reset }: Props) {
  // Get a user-friendly error message
  const errorMessage = React.useMemo(() => {
    // For known errors, return a user-friendly message
    for (const [errorText, friendlyMessage] of Object.entries(KNOWN_ERRORS)) {
      if (error.message.includes(errorText)) {
        return friendlyMessage
      }
    }

    // For production, don't show actual error messages to users
    return process.env.NODE_ENV === "production"
      ? "Something unexpected happened. Our team has been notified."
      : error.message || "An unexpected error occurred"
  }, [error.message])

  React.useEffect(() => {
    // Log the error in development environment
    if (process.env.NODE_ENV !== "production") {
      console.error("Error:", error)
      return
    }

    // In production, send to error monitoring service
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    // Send to our error logging API
    if (typeof window !== 'undefined') {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
      }).catch(() => {
        // Fallback to console if API logging fails
        console.error(JSON.stringify({
          level: "error",
          context: "client",
          ...errorInfo
        }))
      })
    }
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground mb-4">
            {errorMessage}
          </p>
          {error.digest && process.env.NODE_ENV === "production" && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-xs font-mono">Error ID: {error.digest}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>
            Return to homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}