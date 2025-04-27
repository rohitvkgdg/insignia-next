"use client"

import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignInButton() {
  const { status } = useSession()

  if (status === "authenticated") {
    return null
  }

  return (
    <Button variant="outline" onClick={() => signIn("google")}>
      Sign In
    </Button>
  )
}