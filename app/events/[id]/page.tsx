import { notFound } from "next/navigation"
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react"
import { getEventById } from "@/app/actions/events"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import RegisterButton from "./register-button"
import { formatDate } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface EventRegistration {
  id: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  details: string | null;
  date: Date;
  time: string;
  location: string;
  capacity: number | null;
  image: string | null;
  registrations: EventRegistration[];
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const [result, session] = await Promise.all([
    getEventById(params.id),
    getServerSession(authOptions)
  ]);

  if (!result?.data) {
    notFound();
  }

  const event = result.data as EventData;
  const isFull = event.registrations.length >= (event.capacity || 0);
  const isRegistered = session?.user ? 
    event.registrations.some(r => r.user?.id === session.user.id) : 
    false;

  return (
    <div className="container py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg">
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="h-full w-full object-cover" />
          </div>
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Event Details</h2>
            {event.details && (
              <div dangerouslySetInnerHTML={{ __html: event.details }} />
            )}
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>Register for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {event.registrations.length} / {event.capacity} registered
                    {isFull && (
                      <span className="ml-2 text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Full
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                <RegisterButton 
                  eventId={event.id} 
                  isRegistered={isRegistered}
                />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
