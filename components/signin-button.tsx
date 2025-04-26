"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignInButton() {
  return (
    <Button variant="outline" onClick={() => signIn("google")}>
      Sign In
    </Button>
  )
}