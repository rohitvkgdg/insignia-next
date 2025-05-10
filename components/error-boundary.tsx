'use client'

import React from 'react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface ErrorBoundaryProps {
  error: (Error & { digest?: string }) | null
  resetAction: () => void
  children: React.ReactNode
}

export default function ErrorBoundary({
  error,
  resetAction,
  children
}: ErrorBoundaryProps) {
  useEffect(() => {
    if (error) {
      // Log the error to your error reporting service
      console.error('Error boundary caught error:', error)
    }
  }, [error])

  if (!error) return children

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTitle className="text-xl font-bold tracking-tight">
          {error.name || 'Error'}
        </AlertTitle>
        <AlertDescription className="mt-4 flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
            <Button 
              variant="default"
              onClick={() => resetAction()}
            >
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}