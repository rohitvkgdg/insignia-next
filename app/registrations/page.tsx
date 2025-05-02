import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/app/actions/profile"
import RegistrationsClient from "@/app/registrations/client"
import { Skeleton } from "@/components/ui/skeleton"

function RegistrationsSkeleton() {
  return (
    <div className="container py-36">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function RegistrationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<RegistrationsSkeleton />}>
      <RegistrationsContent />
    </Suspense>
  )
}

async function RegistrationsContent() {
  const profile = await getUserProfile()
  return <RegistrationsClient registrations={profile.registrations} />
}