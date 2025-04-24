import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { db } from "@/lib/db"
import { event, registration } from "@/schema"
import { eventCategoryEnum } from "@/schema"
import { sql } from "drizzle-orm"
import { asc, eq, inArray } from "drizzle-orm"

// Add interfaces at the top of the file
interface Event {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  time: string;
  location: string;
  capacity: number | null;
  image: string | null;
  _count: {
    registrations: number;
  };
}

async function getEvents(category?: string) {
  if (category && category !== "all") {
    const events = await db
      .select({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        capacity: event.capacity,
        image: event.image,
        _count: sql`COUNT(${registration.id})`.as("registrations_count"),
      })
      .from(event)
      .leftJoin(registration, eq(registration.eventId, event.id))
      .where(eq(event.category, category.toUpperCase() as typeof eventCategoryEnum.enumValues[number]))
      .groupBy(event.id)
      .orderBy(asc(event.date));

    return events.map((e) => ({
      ...e,
      _count: { registrations: Number(e._count) },
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
      capacity: event.capacity,
      image: event.image,
      _count: sql`(
        SELECT COUNT(*)
        FROM ${registration}
        WHERE ${registration.eventId} = ${event.id}
      )`.as("registrations_count"),
    })
    .from(event)
    .where(inArray(event.category, ["CENTRALIZED", "DEPARTMENT", "CULTURAL"]))
    .orderBy(asc(event.date));

  return events.map((e) => ({
    ...e,
    _count: { registrations: Number(e._count) },
  }));
}

function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event._count.registrations} / {event.capacity} registered
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function EventSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

function EventGrid({ events }: { events: Event[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event: Event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

function EventSkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <EventSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const events = await getEvents(searchParams?.category || "all");

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Browse and register for upcoming events</p>
        </div>
      </div>
      <div className="mt-8">
        <Tabs defaultValue={searchParams?.category || "all"} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all" asChild>
              <Link href="/events">All Events</Link>
            </TabsTrigger>
            <TabsTrigger value="centralized" asChild>
              <Link href="/events?category=centralized">Centralized</Link>
            </TabsTrigger>
            <TabsTrigger value="department" asChild>
              <Link href="/events?category=department">Department</Link>
            </TabsTrigger>
            <TabsTrigger value="cultural" asChild>
              <Link href="/events?category=cultural">Cultural</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={searchParams?.category || "all"} className="mt-0">
            <Suspense fallback={<EventSkeletonGrid />}>
              <EventGrid events={events} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
