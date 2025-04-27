import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getRecentRegistrations, getAdminEvents } from "@/app/actions/admin"
import AdminDashboard from "./client"
import { Role, PaymentStatus } from "@/types/enums"

interface RegistrationData {
  id: string
  userName: string | null
  eventName: string
  date: string
  status: string
  paymentStatus: PaymentStatus
}

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

    // Fetch initial data
    const [registrationsResponse, events] = await Promise.all([
      getRecentRegistrations(),
      getAdminEvents()
    ])
    
    // Transform events data to ensure it's serializable
    const serializedEvents = events.map(event => ({
      ...event,
      date: new Date(event.date).toISOString(),
      registrationCount: Number(event.registrationCount || 0)
    }))

    // Validate registration data
    const validRegistrations = registrationsResponse.data.map(reg => ({
      ...reg,
      date: new Date(reg.date).toISOString()
    }))

    return (
      <AdminDashboard 
        initialRegistrations={validRegistrations}
        initialEvents={serializedEvents}
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