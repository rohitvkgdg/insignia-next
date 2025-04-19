import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

// This would normally come from a database
const events = [
  {
    id: "1",
    title: "Tech Symposium 2023",
    description: "A technical symposium featuring workshops, competitions, and talks.",
    category: "centralized",
    date: "2023-10-15",
    time: "09:00 AM - 05:00 PM",
    location: "Main Auditorium",
    capacity: 500,
    registeredCount: 320,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "2",
    title: "Cultural Night",
    description: "An evening of music, dance, and theatrical performances.",
    category: "cultural",
    date: "2023-10-20",
    time: "06:00 PM - 10:00 PM",
    location: "Open Air Theatre",
    capacity: 1000,
    registeredCount: 750,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "3",
    title: "Robotics Workshop",
    description: "Hands-on workshop on building and programming robots.",
    category: "department",
    date: "2023-10-25",
    time: "10:00 AM - 04:00 PM",
    location: "Engineering Block",
    capacity: 100,
    registeredCount: 85,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "4",
    title: "Hackathon 2023",
    description: "24-hour coding competition to solve real-world problems.",
    category: "centralized",
    date: "2023-11-05",
    time: "09:00 AM - 09:00 AM (Next day)",
    location: "Computer Science Department",
    capacity: 200,
    registeredCount: 180,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "5",
    title: "Dance Competition",
    description: "Annual inter-college dance competition.",
    category: "cultural",
    date: "2023-11-10",
    time: "05:00 PM - 09:00 PM",
    location: "Cultural Center",
    capacity: 300,
    registeredCount: 150,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "6",
    title: "AI & ML Seminar",
    description: "Seminar on the latest trends in Artificial Intelligence and Machine Learning.",
    category: "department",
    date: "2023-11-15",
    time: "11:00 AM - 01:00 PM",
    location: "Seminar Hall",
    capacity: 150,
    registeredCount: 120,
    image: "/placeholder.svg?height=200&width=400",
  },
]

function EventCard({ event }: { event: (typeof events)[0] }) {
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
            <span>{event.date}</span>
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
              {event.registeredCount} / {event.capacity} registered
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
// @ts-ignore
function EventGrid({ events }: { events: typeof events }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {// @ts-ignore 
      events.map((event) => (
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
  const category = searchParams.category || "all"

  const filteredEvents = category === "all" ? events : events.filter((event) => event.category === category)

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Browse and register for upcoming events</p>
        </div>
      </div>
      <div className="mt-8">
        <Tabs defaultValue={category} className="w-full">
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
          <TabsContent value={category} className="mt-0">
            <Suspense fallback={<EventSkeletonGrid />}>
              <EventGrid events={filteredEvents} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
