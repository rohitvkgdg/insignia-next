import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, Users, ChevronDown } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { db } from "@/lib/db"
import { event, registration } from "@/schema"
import { eventCategoryEnum } from "@/schema"
import { asc, eq, inArray, and } from "drizzle-orm"
import { EventCategoryNavigation } from "@/app/events/event-navigation"
import { CardContainer } from "@/components/ui/3d-card"

// Add interfaces at the top of the file
interface Event {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  time: string;
  location: string;
  image: string | null;
  department: "CSE" | "ISE" | "AIML" | "ECE" | "EEE" | "MECH" | "CIVIL" | "PHY" | "CHEM" | "CHTY" | "HUM" | "MATH" | null;
}

async function getEvents(category?: string, department?: string) {
  if (category && category !== "all") {
    // Convert department to uppercase for consistency with the enum values in the database
    const validDepartments = ["CSE", "ISE", "AIML", "ECE", "EEE", "MECH", "CIVIL", "PHY", "CHEM", "CHTY", "HUM", "MATH"] as const;
    const departmentValue = department?.toUpperCase() as typeof validDepartments[number] | undefined;
    const isValidDepartment = departmentValue && validDepartments.includes(departmentValue as any);
    
    const events = await db
      .select({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image,
        department: event.department,
      })
      .from(event)
      .leftJoin(registration, eq(registration.eventId, event.id))
      .where(
        category === "technical" && department && isValidDepartment
          ? and(
              eq(event.category, "TECHNICAL"),
              eq(event.department, departmentValue as typeof validDepartments[number])
            )
          : eq(event.category, category.toUpperCase() as typeof eventCategoryEnum.enumValues[number])
      )
      .groupBy(event.id)
      .orderBy(asc(event.date));

    return events.map((e) => ({
      ...e,
    }));
  }

  const events = await db
    .select({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      department: event.department,
    })
    .from(event)
    .where(inArray(event.category, ["CENTRALIZED", "TECHNICAL", "CULTURAL","FINEARTS","LITERARY"]))
    .orderBy(asc(event.date));

  return events.map((e) => ({
    ...e,
  }));
}

function EventCard({ event }: { event: Event }) {
  return (
    <CardContainer className="flex flex-col h-full overflow-hidden">
      <Card className="w-full h-full">
        <div className="w-full p-2">
          <AspectRatio ratio={1 / 1.414} className="overflow-hidden rounded-md bg-muted">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="h-full w-full object-cover"
              loading="lazy"
              sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              decoding="async"
            />
          </AspectRatio>
        </div>
        <CardHeader className="flex-1 space-y-2">
          <CardTitle className="line-clamp-2 text-lg sm:text-xl">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto pt-0">
          <Link href={`/events/${event.id}`} className="w-full">
            <Button className="w-full" size="sm">View Details</Button>
          </Link>
        </CardFooter>
      </Card>
    </CardContainer>
  )
}

function EventSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="w-full p-2">
        <AspectRatio ratio={1 / 1.414} className="overflow-hidden rounded-md bg-muted">
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </div>
      <CardHeader className="flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

function EventGrid({ events }: { events: Event[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-0 sm:gap-x-6 sm:gap-y-0 p-4">
      {events.map((event: Event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

function EventSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-0 sm:gap-x-6 sm:gap-y-0 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <EventSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { category?: string; department?: string }
}) {
  const events = await getEvents(searchParams?.category, searchParams?.department)

  return (
    <div className="container py-40">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Browse and register for upcoming events</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <EventCategoryNavigation 
          currentCategory={searchParams?.category} 
          department={searchParams?.department} 
        />
        <div className="w-full">
          <Suspense fallback={<EventSkeletonGrid />}>
            <EventGrid events={events} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
