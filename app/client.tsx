'use client'

interface HomeClientProps {
  children: React.ReactNode
}

export default function HomeClient({ children }: HomeClientProps) {
  return <>{children}</>
}