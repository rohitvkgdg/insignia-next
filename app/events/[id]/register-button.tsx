"use client"

import { useState } from "react"
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
}

export default function RegisterButton({ 
  eventId, 
  isRegistered = false,
  isTeamEvent = false,
  minTeamSize = 2,
  maxTeamSize = 5
}: RegisterButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const router = useRouter()

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

      // Check profile completion
      if (!session.user.profileCompleted) {
        const callbackUrl = encodeURIComponent(`/events/${eventId}`)
        toast.info("Please complete your profile first")
        router.push(`/profile?callbackUrl=${callbackUrl}`)
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
      <Button variant="outline" disabled>
        Registered
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleRegister} 
      disabled={isLoading}
    >
      {isLoading ? "Registering..." : "Register Now"}
    </Button>
  )
}
