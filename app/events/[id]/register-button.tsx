"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { registerForEvent } from "@/app/actions/events"
import { toast } from "sonner"

interface RegisterButtonProps {
  eventId: string
  isRegistered?: boolean
  isTeamEvent?: boolean
  minTeamSize?: number
  maxTeamSize?: number
  className?: string
}

export default function RegisterButton({ 
  eventId, 
  isRegistered = false,
  isTeamEvent = false,
  className
}: RegisterButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const router = useRouter()

  // Update local state when prop changes
  useEffect(() => {
    setRegistered(isRegistered)
  }, [isRegistered])

  const handleRegister = async () => {
    try {
      setIsLoading(true)
      
      // If user is not authenticated, save current event URL and redirect to sign in
      if (status !== "authenticated") {
        const eventUrl = `/events/${eventId}`
        await signIn("google", {
          callbackUrl: eventUrl,
          redirect: true
        })
        return
      }

      // If profile is not complete, redirect to profile page with event registration info
      if (!session?.user?.profileCompleted) {
        const callbackUrl = `/events/${eventId}`
        router.push(`/profile?registrationEventId=${eventId}&isTeam=${isTeamEvent}&callbackUrl=${encodeURIComponent(callbackUrl)}`)
        return
      }

      // If it's a team event, redirect to team registration form
      if (isTeamEvent) {
        router.push(`/events/${eventId}/team-registration`)
        return
      }

      // Otherwise, proceed with individual registration
      const result = await registerForEvent(eventId)

      if (!result.success) {
        throw new Error(result.error)
      }

      setRegistered(true)
      toast.success("Successfully registered for the event")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register for event")
    } finally {
      setIsLoading(false)
    }
  }

  if (registered) {
    return (
      <Button variant="outline" disabled className={className}>
        Registered
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleRegister} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Registering..." : "Register Now"}
    </Button>
  )
}
