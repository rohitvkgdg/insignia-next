import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getRegistrations, getAdminEvents } from "@/app/actions/admin"
import AdminDashboard from "./client"
import { Role } from "@/types/enums"

interface SessionUser {
  id: string
  role: Role
  email: string
}

export default async function AdminWrapper() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      redirect("/auth/signin?callbackUrl=/admin")
    }

    const user = session.user as SessionUser
    
    // Check authorization
    if (user.role !== Role.ADMIN) {
      redirect("/auth/signin?error=unauthorized")
    }

    // Fetch initial data with pagination
    const [registrationsResponse, eventsResponse] = await Promise.all([
      getRegistrations(1, 10), // page 1, 10 items per page
      getAdminEvents(1, 12)    // page 1, 12 items per page
    ])
    
    // Return the client component with initial data
    return (
      <AdminDashboard 
        initialRegistrations={registrationsResponse.data}
        initialEvents={eventsResponse.data}
      />
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      redirect("/auth/signin?error=unauthorized")
    }
    
    console.error("Admin dashboard error:", error)
    throw new Error("Failed to load admin dashboard")
  }
}