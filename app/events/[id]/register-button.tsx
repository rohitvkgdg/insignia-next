"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { registerForEvent } from "@/app/actions/events"
import { Check } from "lucide-react"

export default function RegisterButton({
  eventId,
  isRegistered = false,
}: {
  eventId: string
  isRegistered?: boolean
}) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async () => {
    if (status !== "authenticated") {
      router.push("/auth/signin")
      return
    }

    setIsLoading(true)
    try {
      await registerForEvent(eventId)
      setRegistered(true)
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event.",
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (registered) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        <Check className="mr-2 h-4 w-4" />
        Registered
      </Button>
    )
  }

  return (
    <Button className="w-full" onClick={handleRegister} disabled={isLoading}>
      {isLoading ? "Registering..." : "Register Now"}
    </Button>
  )
}
