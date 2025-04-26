"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { registerForEvent } from "@/app/actions/events"
import { Loader2, Check } from "lucide-react"

interface RegisterButtonProps {
  eventId: string
  isRegistered?: boolean
}

export default function RegisterButton({ eventId, isRegistered = false }: RegisterButtonProps) {
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
        router.push(`/profile?callbackUrl=${callbackUrl}`)
        return
      }

      // Try to register for the event
      const result = await registerForEvent(eventId)
      
      if (result.success) {
        setRegistered(true)
        toast.success(result.message)
        router.refresh()
      }
    } catch (error: any) {
      if (error.code === "INCOMPLETE_PROFILE") {
        const returnUrl = encodeURIComponent(`/events/${eventId}`)
        router.push(`/profile?return=${returnUrl}`)
        return
      }

      if (error.code === "ALREADY_REGISTERED") {
        setRegistered(true)
        toast.info("You're already registered for this event")
        return
      }

      // Handle other errors
      toast.error(error.message || "Failed to register for event")
    } finally {
      setIsLoading(false)
    }
  }

  if (registered) {
    return (
      <Button
        className="w-full"
        variant="secondary"
        disabled
      >
        <Check className="mr-2 h-4 w-4" />
        Registered
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      onClick={handleRegister}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : (
        "Register Now"
      )}
    </Button>
  )
}
