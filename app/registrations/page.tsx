import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/app/actions/profile"
import RegistrationsClient from "@/app/registrations/client"

export default async function RegistrationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const profile = await getUserProfile()
  
  return <RegistrationsClient registrations={profile.registrations} />
}