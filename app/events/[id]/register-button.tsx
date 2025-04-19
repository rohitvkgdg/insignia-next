"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { registerForEvent } from "@/app/actions/events"

export default function RegisterButton({
  eventId,
  isFull,
}: {
  eventId: string
  isFull: boolean
}) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
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

  return (
    <Button className="w-full" onClick={handleRegister} disabled={isLoading || isFull}>
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          Registering...
        </>
      ) : isFull ? (
        "Registration Closed"
      ) : (
        "Register Now"
      )}
    </Button>
  )
}
