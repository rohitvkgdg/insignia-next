import { Suspense } from "react"
import { getEventById } from "@/app/actions/events"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import TeamRegistrationForm from "../team-registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TeamRegistrationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/events/${params.id}/team-registration`)
  }

  // For new users or incomplete profiles, redirect to profile page with registration info
  if (!session.user.profileCompleted || !session.user.name || !session.user.usn || !session.user.phone) {
    const callbackUrl = `/events/${params.id}/team-registration`
    redirect(`/profile?registrationEventId=${params.id}&isTeam=true&callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  const eventResult = await getEventById(params.id)
  
  if (!eventResult) {
    redirect("/events")
  }

  const event = eventResult.data
  
  if (!event.isTeamEvent) {
    redirect(`/events/${params.id}`)
  }

  return (
    <div className="container py-36">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Team Registration</CardTitle>
          <CardDescription>Register your team for {event.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamRegistrationForm 
            eventId={event.id} 
            minTeamSize={event.minTeamSize || 2}
            maxTeamSize={event.maxTeamSize || 5}
          />
        </CardContent>
      </Card>
    </div>
  )
}