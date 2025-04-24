import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventForm } from "@/components/admin/EventForm"
import { updateEvent, getEventById } from "@/app/actions/events"
import { EventFormData } from "@/app/actions/events"
import { revalidatePath } from "next/cache"

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/events/${params.id}/edit")
  }

  const eventData = await getEventById(params.id)
  if (!eventData?.data) {
    redirect("/admin")
  }

  const event = eventData.data

  // Format the date for the form
  const defaultValues: Partial<EventFormData> = {
    title: event.title,
    description: event.description || "",
    date: event.date.toISOString().split('T')[0],
    time: event.time,
    location: event.location,
    category: event.category,
    capacity: event.capacity || 100,
    fee: event.fee,
    details: event.details,
    image: event.image || undefined,
  }

  async function handleUpdateEventAction(data: EventFormData) {
    "use server"
    
    if (!session?.user) {
      throw new Error("Unauthorized")
    }
    
    const result = await updateEvent(params.id, data, session.user.id)
    
    if (!result.success) {
      throw new Error("Failed to update event")
    }
    
    revalidatePath('/admin')
    redirect("/admin")
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
            <CardDescription>Update the event details below</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <EventForm 
                defaultValues={defaultValues}
                action={handleUpdateEventAction}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}