"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { registerForEvent } from "@/app/actions/events"
import { Loader2, Check } from "lucide-react"
import TeamRegistrationForm from "./team-registration-form"

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
      // Check if user is authenticated
      if (status !== "authenticated") {
        await signIn("google", {
          callbackUrl: `/events/${eventId}`,
          redirect: true
        })
        return
      }

      // Check if profile is completed
      if (!session?.user?.profileCompleted) {
        const callbackUrl = encodeURIComponent(`/events/${eventId}`)
        toast.info("Please complete your profile first")
        await router.push(`/profile?callbackUrl=${callbackUrl}`)
        return
      }

      const result = await registerForEvent(eventId)
      if (!result.success) {
        if (result.code === "INCOMPLETE_PROFILE") {
          const callbackUrl = encodeURIComponent(`/events/${eventId}`)
          toast.info("Please complete your profile first")
          router.push(`/profile?callbackUrl=${callbackUrl}`)
          return
        }
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

  if (registered || isRegistered) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        <Check className="mr-2 h-4 w-4" />
        Registered
      </Button>
    )
  }

  if (isTeamEvent) {
    return (
      <TeamRegistrationForm 
        eventId={eventId} 
        minTeamSize={minTeamSize} 
        maxTeamSize={maxTeamSize} 
      />
    )
  }

  return (
    <Button
      onClick={handleRegister}
      className="w-full"
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Registering..." : "Register"}
    </Button>
  )
}
