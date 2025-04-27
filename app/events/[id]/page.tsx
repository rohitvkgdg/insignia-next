import { notFound } from "next/navigation"
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react"
import { getEventById } from "@/app/actions/events"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import RegisterButton from "./register-button"
import { formatDate } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface EventRegistration {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  notes: string | null;
  user: {
    id: string;
    name: string | null;
  };
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  details: string | null;
  date: Date;
  time: string;
  location: string;
  image: string | null;
  isTeamEvent: boolean;
  minTeamSize: number | null;
  maxTeamSize: number | null;
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
  const isRegistered = session?.user ? 
    event.registrations.some(r => r.user?.id === session.user.id) : 
    false;

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground mt-2">{event.description}</p>
          </div>
          <div className="relative w-full max-w-4xl mx-auto">
            <AspectRatio ratio={1 / 1.414} className="overflow-hidden rounded-lg bg-muted">
              <img 
                src={event.image || "/placeholder.svg"} 
                alt={event.title} 
                className="h-full w-full object-cover object-center transition-all"
                loading="eager"
                sizes="(min-width: 1024px) 66vw, 100vw"
                decoding="sync"
              />
            </AspectRatio>
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
              <CardDescription>
                {event.isTeamEvent 
                  ? `Team event (${event.minTeamSize}-${event.maxTeamSize} members)`
                  : "Individual registration"}
              </CardDescription>
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
                    {event.registrations.length} registered
                  </span>
                </div>
                {event.isTeamEvent && (
                  <div className="rounded-md bg-muted p-3">
                    <h4 className="mb-2 font-medium">Team Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Minimum team size: {event.minTeamSize} members</li>
                      <li>• Maximum team size: {event.maxTeamSize} members</li>
                      <li>• Each member must provide their details</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <RegisterButton 
                eventId={event.id} 
                isRegistered={isRegistered}
                isTeamEvent={event.isTeamEvent}
                minTeamSize={event.minTeamSize || 2}
                maxTeamSize={event.maxTeamSize || 5}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
