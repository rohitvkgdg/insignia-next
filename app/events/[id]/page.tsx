import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Calendar, Clock, MapPin, Users, IndianRupeeIcon } from "lucide-react"
import { getEventById } from "@/app/actions/events"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import RegisterButton from "./register-button"
import { formatDate } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

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
  fee: number | null;
  date: Date;
  time: string;
  location: string;
  image: string | null;
  isTeamEvent: boolean;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  registrations: EventRegistration[];
  category: "CENTRALIZED" | "TECHNICAL" | "CULTURAL" | "FINEARTS" | "LITERARY";
}

function EventSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-36">
      <div className="mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="relative w-full max-w-xs mx-auto">
            <Skeleton className="aspect-[1/1.414] rounded-lg" />
          </div>
        </div>
        <div className="flex-[2] space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
        </div>
      </div>
    </div>
  )
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

  const details = event.details || "";
  const hasDetails = details.length > 0;

  return (
    <Suspense fallback={<EventSkeleton />}>
      {/* Main Container with Padding Bottom for Mobile */}
      <div className="container max-w-7xl mx-auto py-36 pb-28 lg:pb-36">
        {/* Event Header Section */}
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">{event.title}</h1>
          <p className="text-muted-foreground text-sm md:text-xl leading-relaxed">{event.description}</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Content Section */}
          <div className="flex-1">
            <div className="relative w-full max-w-xs mx-auto">
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
                <div 
                  className="text-lg leading-loose" 
                  dangerouslySetInnerHTML={{ __html: event.details }}
                />
                )}
            </div>
          </div>

          {/* Desktop Registration Card - Hidden on Mobile */}
          <div className="hidden lg:block w-[400px]">
            <div className="sticky top-36">
              <Card className="shadow-lg bg-transparent/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                  <CardDescription>
                    {event.isTeamEvent 
                      ? `Team event (${event.minTeamSize}-${event.maxTeamSize} members)`
                      : "Individual registration"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
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
                      <IndianRupeeIcon className="h-5 w-5 text-muted-foreground" />
                      <span>
                        {event.fee}/person
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
                    className="w-full shadow-lg"
                  />
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Registration Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="p-2 rounded-2xl backdrop-blur-lg bg-transparent/20 shadow-lg">
            <div className="container max-w-7xl mx-auto">
              <div className="flex flex-col gap-4">
                
                {/* Registration Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="truncate">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium truncate">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div className="truncate">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-medium truncate">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="truncate">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium truncate">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupeeIcon className="h-4 w-4 text-primary" />
                    <div className="truncate">
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="font-medium truncate">{event.fee}</p>
                    </div>
                  </div>
                </div>

                {/* Team Requirements if applicable */}
                {event.isTeamEvent && (
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg text-sm">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground truncate">
                      Team size: {event.minTeamSize}-{event.maxTeamSize} members
                    </p>
                  </div>
                )}

                {/* Registration Button */}
                <RegisterButton 
                  eventId={event.id} 
                  isRegistered={isRegistered}
                  isTeamEvent={event.isTeamEvent}
                  minTeamSize={event.minTeamSize || 2}
                  maxTeamSize={event.maxTeamSize || 5}
                  className="w-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
