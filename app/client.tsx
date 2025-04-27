'use client'

import { useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"

interface HomeClientProps {
  children: React.ReactNode
}

export default function HomeClient({ children }: HomeClientProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return <LoadingScreen>{children}</LoadingScreen>
  }

  return <>{children}</>
}