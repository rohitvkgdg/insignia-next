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
  image: string | null;
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
        image: event.image,
      })
      .from(event)
      .leftJoin(registration, eq(registration.eventId, event.id))
      .where(eq(event.category, category.toUpperCase() as typeof eventCategoryEnum.enumValues[number]))
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
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-transform hover:scale-105">
      <div className="relative aspect-auto mx-auto overflow-hidden p-2">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover rounded-md "
          style={{
            objectFit: 'cover',
            aspectRatio: 1 / 1.414
          }}
        />
      </div>
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 text-xl">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function EventSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="h-[212px] w-[150px] mx-auto mt-4">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
      <CardHeader className="flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
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
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {events.map((event: Event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

function EventSkeletonGrid() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
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
  const events = await getEvents(await searchParams?.category || "all");

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Browse and register for upcoming events</p>
        </div>
      </div>
      <div className="mt-8">
        <Tabs defaultValue={await searchParams?.category || "all"} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all" asChild>
              <Link href="/events">All Events</Link>
            </TabsTrigger>
            <TabsTrigger value="centralized" asChild>
              <Link href="/events?category=centralized">Centralized</Link>
            </TabsTrigger>
            <TabsTrigger value="technical" asChild>
              <Link href="/events?category=technical">Technical</Link>
            </TabsTrigger>
            <TabsTrigger value="cultural" asChild>
              <Link href="/events?category=cultural">Cultural</Link>
            </TabsTrigger>
            <TabsTrigger value="finearts" asChild>
              <Link href="/events?category=finearts">Finearts</Link>
            </TabsTrigger>
            <TabsTrigger value="literary" asChild>
              <Link href="/events?category=literary">Literary</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={await searchParams?.category || "all"} className="mt-0">
            <Suspense fallback={<EventSkeletonGrid />}>
              <EventGrid events={events} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
