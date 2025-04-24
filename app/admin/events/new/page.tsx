import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventForm } from "@/components/admin/EventForm"
import { createEvent } from "@/app/actions/events"
import { EventFormData } from "@/app/actions/events"

export default async function NewEventPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/events/new")
  }

  async function handleCreateEventAction(data: EventFormData) {
    "use server"
    if (!session?.user) {
      throw new Error("Unauthorized")
    }
    await createEvent(data, session.user.id)
    redirect("/admin")
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>Fill in the event details below</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <EventForm action={handleCreateEventAction} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}