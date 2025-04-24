import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { getUserProfile } from "@/app/actions/profile"
import ProfileClient from "./client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { authOptions } from "../api/auth/[...nextauth]/route"

export const metadata = {
  title: "Profile | Insignia",
  description: "Manage your profile and event registrations"
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  try {
    // Fetch user profile data - now returns a plain JavaScript object
    const profileData = await getUserProfile()
    
    // Now we can directly pass the data to the client component
    return <ProfileClient profile={profileData} />
  } catch (error) {
    console.error("Error loading profile:", error)
    
    // Return an error state
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-medium mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground">
            There was a problem loading your profile. Please try again later.
          </p>
        </Card>
      </div>
    )
  }
}

// Loading state component
export function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-10 w-1/4 mb-6" />
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/3">
          <Skeleton className="h-[350px] w-full rounded-lg" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
