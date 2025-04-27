import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventForm } from "@/components/admin/EventForm"
import type { EventFormValues } from "@/components/admin/EventForm"
import { updateEvent, getEventById } from "@/app/actions/events"
import { EventFormData } from "@/app/actions/events"
import { revalidatePath } from "next/cache"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/events/${id}/edit")
  }

  const eventData = await getEventById(id)
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
    fee: event.fee,
    details: event.details,
    image: event.image || undefined,
  }

  async function handleUpdateEventAction(data: EventFormValues) {
    "use server"
    
    if (!session?.user) {
      throw new Error("Unauthorized")
    }
    
    const { imageFile, ...updateData } = data
    
    // Handle image data - only pass string values, not File objects
    const cleanedData = {
      ...updateData,
      image: typeof updateData.image === 'string' ? updateData.image : undefined
    }
    
    const result = await updateEvent(id, cleanedData, session.user.id)
    
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