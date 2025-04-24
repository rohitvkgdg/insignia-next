import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getRecentRegistrations, getAdminEvents } from "@/app/actions/admin"
import AdminDashboard from "./client"
import { Role, PaymentStatus } from "@/types/enums"

interface RegistrationData {
  id: string
  userName: string
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
      throw new Error("Unauthorized: Insufficient permissions")
    }

    // Fetch initial data
    const [registrations, events] = await Promise.all([
      getRecentRegistrations(),
      getAdminEvents()
    ])
    
    if (!Array.isArray(registrations)) {
      throw new Error("Invalid response format from registration service")
    }

    // Validate registration data
    const validRegistrations = registrations.filter((reg): reg is RegistrationData => {
      if (!reg || typeof reg !== "object") return false
      
      return (
        typeof reg.id === "string" &&
        typeof reg.userName === "string" &&
        typeof reg.eventName === "string" &&
        typeof reg.date === "string" &&
        typeof reg.status === "string" &&
        Object.values(PaymentStatus).includes(reg.paymentStatus)
      )
    })

    return (
      <AdminDashboard 
        initialRegistrations={validRegistrations}
        initialEvents={events}
      />
    )
  } catch (error) {
    // Redirect to error page for critical failures
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      redirect("/unauthorized")
    }

    throw error
  }
}