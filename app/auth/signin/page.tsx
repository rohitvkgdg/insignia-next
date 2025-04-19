"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"

// Define error messages for known error types
const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Could not start the sign in process.",
  OAuthCallback: "Error receiving data from the authentication provider.",
  OAuthCreateAccount: "Could not create user account in the database.",
  EmailCreateAccount: "Could not create user account.",
  Callback: "Error during callback processing.",
  OAuthAccountNotLinked: "This email is already associated with another provider.",
  EmailSignin: "Check your email for a sign in link.",
  CredentialsSignin: "Invalid credentials.",
  SessionRequired: "Please sign in to access this page.",
  Default: "Unable to sign in at this time. Please try again later."
};

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  // Extract and process error from URL on page load
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      // Handle the undefined error specifically
      if (errorParam === "undefined") {
        setError("Connection to authentication service failed. Please try again.")
      } else {
        setError(ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default)
      }
    }
  }, [searchParams])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      setError("Failed to initiate sign in. Please try again.")
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Welcome to <span className="gradient-text">Insignia</span>
          </h1>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Sign in to register for events and manage your profile
          </p>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your preferred sign in method</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button variant="outline" className="w-full" onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <FcGoogle className="mr-2 h-5 w-5" />
              )}
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground">
              By signing in, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
