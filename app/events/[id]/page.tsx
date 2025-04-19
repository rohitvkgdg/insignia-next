import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import RegisterButton from "./register-button"

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
    image: "/placeholder.svg?height=400&width=800",
    details: `
      <p>Join us for the annual Tech Symposium, a day-long event featuring workshops, competitions, and talks from industry experts.</p>
      
      <h3>Schedule:</h3>
      <ul>
        <li>09:00 AM - 10:00 AM: Registration</li>
        <li>10:00 AM - 12:00 PM: Keynote Speeches</li>
        <li>12:00 PM - 01:00 PM: Lunch Break</li>
        <li>01:00 PM - 03:00 PM: Workshops</li>
        <li>03:00 PM - 05:00 PM: Competitions</li>
      </ul>
      
      <h3>Requirements:</h3>
      <p>Participants should bring their laptops and student ID cards.</p>
      
      <h3>Registration Fee:</h3>
      <p>₹500 per participant</p>
    `,
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
    image: "/placeholder.svg?height=400&width=800",
    details: `
      <p>Experience a night of cultural extravaganza featuring music, dance, and theatrical performances by talented students.</p>
      
      <h3>Schedule:</h3>
      <ul>
        <li>06:00 PM - 06:30 PM: Opening Ceremony</li>
        <li>06:30 PM - 08:00 PM: Music Performances</li>
        <li>08:00 PM - 09:00 PM: Dance Performances</li>
        <li>09:00 PM - 10:00 PM: Theatrical Performances</li>
      </ul>
      
      <h3>Registration Fee:</h3>
      <p>₹200 per participant</p>
    `,
  },
  // Add more events as needed
]

export default function EventPage({ params }: { params: { id: string } }) {
  const event = events.find((e) => e.id === params.id)

  if (!event) {
    notFound()
  }

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
            <div dangerouslySetInnerHTML={{ __html: event.details }} />
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
                  <span>{event.date}</span>
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
                    {event.registeredCount} / {event.capacity} registered
                  </span>
                </div>
                {event.registeredCount >= event.capacity && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Registration Closed</AlertTitle>
                    <AlertDescription>This event has reached its maximum capacity.</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <RegisterButton eventId={event.id} isFull={event.registeredCount >= event.capacity} />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
