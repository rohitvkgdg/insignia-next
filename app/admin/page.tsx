export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AdminDashboard from "./client"
import { getRegistrations, getAdminEvents } from "@/app/actions/admin"
import { Skeleton } from "@/components/ui/skeleton"

function AdminDashboardSkeleton() {
  return (
    <div className="container py-10">
      <div className="flex flex-col mt-36 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-6">
          {/* Analytics Section Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>

          {/* Registrations Table Skeleton */}
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Events Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminContent />
    </Suspense>
  )
}

async function AdminContent() {
  const [registrations, events] = await Promise.all([
    getRegistrations(),
    getAdminEvents()
  ]);

  return (
    <AdminDashboard 
      initialRegistrations={registrations.data} 
      initialEvents={events.data} 
    />
  )
}
